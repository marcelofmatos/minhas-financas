#!/usr/bin/env bash
#
# Gera o APK do app "Minhas Finanças" para instalar no celular.
#
# A API key do Google Maps NÃO fica no app.json: ela é lida da variável de
# ambiente GOOGLE_MAPS_API_KEY (ver app.config.js).
#
# Uso:
#   GOOGLE_MAPS_API_KEY=xxxxx ./build.sh           -> build na nuvem (EAS Build), perfil "preview"
#   GOOGLE_MAPS_API_KEY=xxxxx ./build.sh --local   -> build local (precisa Android SDK + JDK 17)
#
# Você também pode colocar a chave num arquivo .env (que está no .gitignore):
#   echo 'GOOGLE_MAPS_API_KEY=xxxxx' > .env
#
# Importante sobre o build NA NUVEM: o app.config.js é avaliado nos servidores
# do EAS, então a variável precisa existir lá. Configure uma vez com:
#   eas env:create --name GOOGLE_MAPS_API_KEY --value xxxxx --environment preview
# (ou adicione um bloco "env" no perfil "preview" do eas.json).
# No build --local a variável do seu shell já é usada diretamente.
#
# O perfil "preview" do eas.json já gera APK (android.buildType = "apk").
# Ao terminar, o EAS mostra um link/QR code para baixar o .apk.

set -e
cd "$(dirname "$0")"

# Carrega .env se existir
if [ -f .env ]; then
  set -a
  # shellcheck disable=SC1091
  . ./.env
  set +a
fi

if [ -z "${GOOGLE_MAPS_API_KEY:-}" ]; then
  echo ">> AVISO: GOOGLE_MAPS_API_KEY não definida — o mapa do Google não vai funcionar no APK."
  echo "   Defina com:  GOOGLE_MAPS_API_KEY=suachave ./build.sh   (ou crie um arquivo .env)"
  echo
fi
export GOOGLE_MAPS_API_KEY

if command -v eas >/dev/null 2>&1; then
  EAS=(eas)
else
  echo ">> eas-cli não encontrado; usando npx eas-cli."
  EAS=(npx --yes eas-cli)
fi

"${EAS[@]}" build --platform android --profile preview "$@"
