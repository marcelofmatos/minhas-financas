#!/usr/bin/env bash
# =============================================================================
# inspect-web-db.sh
# -----------------------------------------------------------------------------
# Inspeciona o banco SQLite que o app cria quando rodamos em modo Web
# (Expo Web no Firefox).
#
# CONTEXTO
# --------
# No mobile (iOS/Android) o expo-sqlite grava um arquivo .db comum no sandbox
# do app. No Web não existe sistema de arquivos: o expo-sqlite usa o
# wa-sqlite com o VFS "OPFS-SAH-Pool", que persiste o banco dentro do
# Origin Private File System (OPFS) do navegador.
#
# Como o Firefox armazena o OPFS no disco:
#   ~/.mozilla/firefox/<perfil>/storage/default/<origem>/fs/<XX>/<HASH>
#
# Cada arquivo do pool tem 4096 bytes de cabeçalho (criados pelo SAH-Pool VFS):
#   - bytes 0..127  -> caminho virtual (ex.: "/minhasfinancas.db")
#   - bytes 128..4095 -> metadados internos do VFS
#   - bytes 4096..  -> banco SQLite "puro" (começa com "SQLite format 3")
#
# Por isso, para abrir o banco com o sqlite3 CLI precisamos:
#   1) localizar o arquivo do pool cujo cabeçalho contém "/minhasfinancas.db"
#   2) extrair o conteúdo a partir do offset 4096 para um .db temporário
#   3) consultar normalmente
#
# USO
# ---
#   ./scripts/inspect-web-db.sh                # detecta perfil/porta automaticamente
#   ./scripts/inspect-web-db.sh -p 8082        # outra porta do Expo Web
#   ./scripts/inspect-web-db.sh -d outra.db    # outro nome de banco virtual
#   ./scripts/inspect-web-db.sh -P meu_perfil  # forçar perfil do Firefox
# =============================================================================

set -euo pipefail

# ---- Parâmetros (com defaults) ----------------------------------------------
DB_NAME="minhasfinancas.db"   # nome usado em SQLite.openDatabaseAsync(...)
PORT="8081"                   # porta padrão do Expo Web
PROFILE=""                    # se vazio, detecta automaticamente
FIREFOX_DIR="$HOME/.mozilla/firefox"

while getopts "d:p:P:h" opt; do
  case "$opt" in
    d) DB_NAME="$OPTARG" ;;
    p) PORT="$OPTARG" ;;
    P) PROFILE="$OPTARG" ;;
    h) sed -n '2,33p' "$0"; exit 0 ;;
    *) echo "uso: $0 [-d db] [-p porta] [-P perfil]"; exit 2 ;;
  esac
done

# ---- 1) Localizar o perfil ativo do Firefox ---------------------------------
# Um Firefox pode ter vários perfis (release, nightly, dev). O perfil "padrão"
# fica registrado em profiles.ini (Default=1 ou flag Locked). Como detectar
# isso de forma robusta envolveria parsear o INI, aqui usamos uma heurística
# simples: o perfil que contém a origem "http+++localhost+<porta>" mais
# recentemente modificada é provavelmente o que está rodando o app.
if [[ -z "$PROFILE" ]]; then
  ORIGIN_DIR=$(find "$FIREFOX_DIR" -maxdepth 5 -type d \
                 -path "*/storage/default/http+++localhost+${PORT}" \
                 -printf '%T@ %p\n' 2>/dev/null \
               | sort -rn | head -1 | cut -d' ' -f2-)
else
  ORIGIN_DIR="$FIREFOX_DIR/$PROFILE/storage/default/http+++localhost+${PORT}"
fi

if [[ -z "$ORIGIN_DIR" || ! -d "$ORIGIN_DIR" ]]; then
  echo "ERRO: não encontrei storage para localhost:${PORT} no Firefox." >&2
  echo "      Abra o app em http://localhost:${PORT} e rode de novo." >&2
  exit 1
fi

FS_DIR="$ORIGIN_DIR/fs"
echo "→ origem encontrada: $ORIGIN_DIR"

# ---- 2) Encontrar o arquivo do pool que contém o nosso banco ----------------
# Precisamos varrer os arquivos em fs/<XX>/<HASH> e ler os primeiros 128 bytes
# de cada um, procurando "/minhasfinancas.db" no cabeçalho do SAH-Pool VFS.
#
# Atenção: se o Firefox estiver com o app aberto, o arquivo pode estar com
# lock exclusivo. O script copia para /tmp antes de inspecionar para evitar
# qualquer interferência com a sessão do navegador.
TARGET=""
while IFS= read -r -d '' f; do
  # head -c 128 lê os 128 bytes iniciais; tr remove os \0 do bloco zerado
  header=$(head -c 128 "$f" 2>/dev/null | tr -d '\0' || true)
  if [[ "$header" == "/${DB_NAME}" ]]; then
    TARGET="$f"
    break
  fi
done < <(find "$FS_DIR" -type f -size +4096c -print0 2>/dev/null)

if [[ -z "$TARGET" ]]; then
  echo "ERRO: nenhum arquivo do OPFS contém '/${DB_NAME}' no cabeçalho." >&2
  echo "      Confirme se o app já foi aberto neste navegador/porta." >&2
  exit 1
fi

echo "→ arquivo OPFS: $TARGET"
echo "→ tamanho: $(stat -c%s "$TARGET") bytes"

# ---- 3) Extrair o SQLite "puro" para um arquivo temporário ------------------
# bs=4096 + skip=1 pula exatamente o cabeçalho do SAH-Pool e copia apenas
# as páginas do banco SQLite. O resultado é um .db comum, abrível por
# qualquer ferramenta (sqlite3 CLI, DB Browser for SQLite, DBeaver...).
TMP_DB=$(mktemp --suffix=.db)
trap 'rm -f "$TMP_DB"' EXIT
dd if="$TARGET" of="$TMP_DB" bs=4096 skip=1 status=none

# Confere se a extração resultou num SQLite válido (magic "SQLite format 3").
if ! head -c 16 "$TMP_DB" | grep -q "SQLite format 3"; then
  echo "ERRO: arquivo extraído não é um SQLite válido." >&2
  exit 1
fi

# ---- 4) Consultas de exemplo ------------------------------------------------
echo
echo "=== Tabelas ==="
sqlite3 "$TMP_DB" ".tables"

echo
echo "=== Schema de transacoes ==="
sqlite3 "$TMP_DB" ".schema transacoes"

echo
echo "=== Total de linhas ==="
sqlite3 "$TMP_DB" "SELECT COUNT(*) AS total FROM transacoes;"

echo
echo "=== Últimas 5 transações ==="
sqlite3 -header -column "$TMP_DB" \
  "SELECT id, descricao, valor, tipo, categoria, data
     FROM transacoes
     ORDER BY rowid DESC
     LIMIT 5;"

echo
echo "→ Para abrir interativamente: sqlite3 $TMP_DB"
echo "  (cópia temporária — será removida ao final do script)"
