# Passo a Passo — Publicando o minhas-financas

**Módulo 06 — Aula 07**  
Prof. Marcelo Matos

> Esta é a última etapa do módulo. Você vai transformar o app que construiu nas últimas aulas em algo que qualquer pessoa pode instalar no celular.

---

## O que você vai fazer

Ao final deste tutorial, você terá:

- `app.json` configurado com nome, versão, ícone e splash screen
- Um ícone profissional criado no Canva
- Um arquivo APK instalável gerado pelo EAS Build
- O APK instalado e testado no seu celular
- Conhecimento do fluxo completo para publicar na Google Play

---

## Antes de Começar — Checklist

- [ ] Projeto `minhas-financas` das Aulas 2, 3, 4, 5 e 6 funcionando
- [ ] Conta criada em [expo.dev](https://expo.dev) (gratuita)
- [ ] Node.js instalado (`node -v`)
- [ ] Terminal aberto na pasta `minhas-financas`

---

## Passo 1 — Configurar o app.json

O `app.json` precisa estar completamente preenchido antes do primeiro build.

### 1.1 — Abra o arquivo `app.json` na raiz do projeto

Substitua o conteúdo por:

```json
{
  "expo": {
    "name": "Minhas Finanças",
    "slug": "minhas-financas",
    "version": "1.5.0",
    "orientation": "portrait",
    "icon": "./assets/icon.png",
    "userInterfaceStyle": "light",
    "splash": {
      "image": "./assets/icon.png",
      "resizeMode": "contain",
      "backgroundColor": "#2c3e50"
    },
    "ios": {
      "supportsTablet": false,
      "bundleIdentifier": "com.seunome.minhasfinancas",
      "buildNumber": "1"
    },
    "android": {
      "adaptiveIcon": {
        "foregroundImage": "./assets/adaptive-icon.png",
        "backgroundColor": "#2c3e50"
      },
      "package": "com.seunome.minhasfinancas",
      "versionCode": 1,
      "permissions": []
    },
    "plugins": [
      "expo-sqlite",
      "expo-location"
    ]
  }
}
```

> **Importante:** Troque `seunome` pelo seu nome ou apelido sem espaços ou acentos. Exemplo: `com.marcelo.minhasfinancas`. Este identificador precisa ser **único no mundo** — escolha algo específico.

> **Não remova o array `plugins`** — ele declara `expo-sqlite` (Aula 5) e `expo-location` (Aula 6). Sem essas entradas o build nativo falha em tempo de execução ao acessar o banco ou o GPS.

> **`version`:** use a versão atual do **seu** projeto, não `"1.0.0"` fixo. Neste módulo o app saiu da `1.0.0` (Aula 1) e recebeu um incremento MINOR a cada aula — ao fim da Aula 6 ele estava em **`1.5.0`**, então é esse o número que vai aqui. O `versionCode` (Android) e o `buildNumber` (iOS) são contadores internos das lojas: começam em `1` e sobem a cada novo envio, independentemente do valor de `version`.

### 1.2 — Entendendo o versionamento

Sempre que você fizer um novo build para publicar na loja, precisará aumentar:
- `version`: a string que o usuário vê ("1.5.0" → "1.5.1" → "1.6.0")
- `android.versionCode`: número inteiro que só sobe (1 → 2 → 3 → ...)

```
version:     "1.5.0"  →  "1.5.1"  →  "1.6.0"  →  "2.0.0"
versionCode:     1    →      2    →      3     →      4
```

---

## Passo 2 — Criar o ícone do app

> **Escolha uma das ferramentas abaixo.** Todas são gratuitas; as duas primeiras não exigem cadastro.

---

### Opção A — icon.kitchen *(recomendado)*

1. Acesse [icon.kitchen](https://icon.kitchen) no navegador
2. Em **"Icon"**, escolha um clipart (pesquise "wallet", "money" ou "chart") ou use texto/emoji
3. Em **"Background"**, defina a cor `#2c3e50`
4. Em **"Foreground"**, defina a cor `#2ecc71`
5. Ajuste o tamanho e padding até ficar satisfeito
6. Clique em **"Download"** — baixa um `.zip` (ex.: `iconkitchen-1234.zip`) com as pastas `ios/`, `android/` e `web/`, contendo todos os tamanhos prontos

---

### Opção B — favicon.io *(alternativa)*

1. Acesse [favicon.io/favicon-generator](https://favicon.io/favicon-generator)
2. Em **"Text"**, coloque um emoji financeiro (ex: `💰` ou `💳`)
3. **Background:** `Rounded` | cor `#2c3e50`
4. **Font color:** `#2ecc71`
5. Clique em **"Generate"** e depois **"Download"**
6. Dentro do `.zip` baixado, use o arquivo `android-chrome-512x512.png` — renomeie para `icon.png`

---

### Opção C — Canva *(requer criação de conta)*

1. Abra [canva.com](https://www.canva.com) e faça login
2. Clique em **"Criar design"** → **"Tamanho personalizado"** → **1024 × 1024 pixels**
3. **Fundo:** cor `#2c3e50` | **Símbolo:** pesquise "carteira" em Elementos, cor `#2ecc71`
4. Exporte como PNG **sem** fundo transparente

---

### 2.1 — Salvar os arquivos no projeto

O `app.json` já espera dois arquivos na pasta `assets/`:

- `icon.png` — ícone principal (mínimo 1024×1024 px, **sem** transparência)
- `adaptive-icon.png` — camada frontal do ícone adaptativo do Android (**com** transparência)

**Se você usou o icon.kitchen (Opção A):** o `.zip` baixado traz as pastas `ios/`, `android/` e `web/`. Extraia tudo dentro de `assets/icons/` (crie a pasta):

```
assets/icons/
├── android/
│   ├── play_store_512.png
│   └── res/mipmap-*/ic_launcher*.png
├── ios/
│   └── AppIcon~ios-marketing.png        # 1024×1024
└── web/
    └── favicon.ico, icon-*.png
```

Depois copie os arquivos que o Expo realmente usa para a raiz de `assets/`:

```bash
cp assets/icons/ios/AppIcon~ios-marketing.png assets/icon.png
cp assets/icons/android/res/mipmap-xxxhdpi/ic_launcher_foreground.png assets/adaptive-icon.png
cp assets/icons/android/play_store_512.png assets/play_store_512.png
```

Resumo dos arquivos de imagem editados (referência):

| Arquivo criado | Origem (icon.kitchen) | Dim. |
|---|---|---|
| `assets/icon.png` | `assets/icons/ios/AppIcon~ios-marketing.png` | 1024×1024 (sem transparência) |
| `assets/adaptive-icon.png` | `assets/icons/android/res/mipmap-xxxhdpi/ic_launcher_foreground.png` | 432×432 (transparente) |
| `assets/play_store_512.png` | `assets/icons/android/play_store_512.png` | 512×512 |

- `icon.png` → ícone do app no iOS e no Android
- `adaptive-icon.png` → camada frontal do ícone adaptativo do Android
- `play_store_512.png` → ícone da ficha da Google Play (usado depois, no Passo 7.3)

> O `ic_launcher_foreground.png` tem só 432×432 — funciona, mas se o icon.kitchen oferecer baixar o *foreground* em 1024 px, prefira essa versão. Em último caso, use o próprio `AppIcon~ios-marketing.png` também como `adaptive-icon.png`.

> Feito isso, a pasta `assets/icons/` não é mais necessária — pode apagá-la.

**Se você usou o favicon.io ou o Canva (Opção B/C):** renomeie a imagem 512×512 (ou 1024×1024) baixada para `icon.png`, copie para `assets/` e use o mesmo arquivo como `adaptive-icon.png`. No VS Code: arraste os arquivos diretamente para a pasta `assets/` no explorador lateral.

> Mantenha o design simples — ícones complexos ficam ilegíveis em tamanhos pequenos (48×48 px na tela do celular).

### 2.2 — Definir a splash screen

Você **não precisa** de uma imagem dedicada para a splash. A forma mais simples é reaproveitar o próprio ícone — o `app.json` do Passo 1 já está assim:

```json
"splash": {
  "image": "./assets/icon.png",
  "resizeMode": "contain",
  "backgroundColor": "#2c3e50"
}
```

Resultado: durante os ~2 segundos de carregamento o ícone aparece centralizado sobre o fundo `#2c3e50`. Nada a fazer aqui.

> **Opcional — splash personalizada:** se quiser uma tela com logo + o texto "Minhas Finanças", crie no Canva (ou qualquer editor) um PNG de **1284 × 2778 px**, fundo `#2c3e50`, texto branco centralizado, salve em `assets/splash.png` e troque `splash.image` para `"./assets/splash.png"`. Nenhuma loja exige isso — é só acabamento.

---

## Passo 3 — Instalar o EAS CLI

### 3.1 — Instale a ferramenta de build

```bash
npm install -g eas-cli
```

### 3.2 — Faça login na sua conta Expo

```bash
eas login
```

Digite o e-mail e senha da sua conta em [expo.dev](https://expo.dev). Se ainda não tem conta, crie em [expo.dev/signup](https://expo.dev/signup) (gratuito).

### 3.3 — Verifique o login

```bash
eas whoami
```

Deve exibir seu e-mail ou nome de usuário.

---

## Passo 4 — Configurar o EAS no projeto

### 4.1 — Inicialize a configuração

```bash
eas build:configure
```

Este comando fará algumas perguntas:

```
? Which platforms would you like to configure for EAS Build?
→ Selecione: All

? Would you like to set up a continuous native generation project?
→ Selecione: No
```

### 4.2 — Verifique o arquivo eas.json criado

```json
{
  "cli": {
    "version": ">= 5.0.0"
  },
  "build": {
    "development": {
      "developmentClient": true,
      "distribution": "internal"
    },
    "preview": {
      "distribution": "internal",
      "android": {
        "buildType": "apk"
      }
    },
    "production": {
      "android": {
        "buildType": "app-bundle"
      }
    }
  }
}
```

Se o arquivo gerado for diferente, substitua pelo conteúdo acima.

---

## Passo 5 — Fazer o build de preview (APK)

O build de **preview** gera um APK que você pode instalar diretamente no celular — sem precisar da Google Play.

### 5.1 — Execute o build

```bash
eas build --platform android --profile preview
```

### 5.2 — Responda as perguntas do EAS

```
? What would you like your Android application id to be?
→ Digite: com.seunome.minhasfinancas (o mesmo do app.json)

? Generate a new Android Keystore?
→ Selecione: Yes (na primeira vez — o EAS cria e armazena com segurança)
```

### 5.3 — Aguarde o build

O build acontece nos servidores da Expo. Você verá:

```
✔ Build queued
✔ Build started
  Build URL: https://expo.dev/accounts/seunome/projects/minhas-financas/builds/...
```

Tempo estimado: **5 a 15 minutos** dependendo da fila.

Você pode acompanhar em tempo real pelo link exibido, ou aguardar o terminal.

### 5.4 — Baixar o APK

Quando concluir:

```
✔ Build finished
  APK: https://expo.dev/.../artifacts/...apk

  Install on Android device:
  $ eas build:run -p android
```

Clique no link ou acesse [expo.dev](https://expo.dev) → seu projeto → "Builds" → baixe o APK.

---

## Passo 6 — Instalar o APK no celular

### 6.1 — Enviar o APK para o celular

**Opção A — Via cabo USB:**
1. Conecte o celular ao computador com cabo USB
2. No celular: "Transferência de arquivos" (modo MTP)
3. Copie o APK para a pasta "Downloads" do celular

**Opção B — Via link direto (mais fácil):**
1. Acesse o link do APK no [expo.dev](https://expo.dev) pelo celular
2. Clique em "Download" no celular diretamente

**Opção C — Via QR code (se o EAS mostrar):**
1. Escaneie o QR code que aparece no terminal

### 6.2 — Instalar no Android

1. Abra o gerenciador de arquivos no celular
2. Vá para "Downloads"
3. Toque no arquivo `.apk`
4. Se aparecer "Fonte desconhecida", vá em:
   Configurações → Segurança → Instalar apps desconhecidos → Permitir para o gerenciador de arquivos
5. Toque em "Instalar"

### 6.3 — Testar o app instalado

O app **Minhas Finanças** vai aparecer no menu do celular com o ícone que você criou. Teste:

- [ ] App abre com a tela correta
- [ ] Splash screen aparece brevemente
- [ ] É possível adicionar transações
- [ ] Dados persistem ao fechar e reabrir
- [ ] Nenhum erro visível

---

## Passo 7 — Publicar na Google Play (Teste Interno)

> Este passo requer uma conta de desenvolvedor na Google Play (US$ 25, taxa única).

### 7.1 — Gerar o build de produção (AAB)

```bash
eas build --platform android --profile production
```

Aguarde o build. O resultado é um arquivo `.aab` (Android App Bundle).

### 7.2 — Acessar o Google Play Console

1. Acesse [play.google.com/console](https://play.google.com/console)
2. Clique em **"Criar app"**
3. Preencha:
   - Nome do app: "Minhas Finanças"
   - Idioma padrão: Português (Brasil)
   - App ou jogo: App
   - Gratuito ou pago: Gratuito
4. Aceite as políticas e clique em "Criar app"

### 7.3 — Preencher a ficha da loja

No menu lateral: **"Presença na Play Store" → "Ficha principal da loja"**

Preencha o mínimo necessário para teste interno:
- **Título:** Minhas Finanças
- **Descrição curta:** Controle suas receitas e despesas com facilidade
- **Descrição completa:** Descreva as funcionalidades do app (3–5 parágrafos)
- **Ícone:** 512×512 px (use o mesmo que criou no Canva, exportado em 512px)
- **Screenshots:** faça 2 capturas de tela do app no emulador e envie
- **Categoria:** Finanças
- **Classificação de conteúdo:** responda o questionário (app financeiro = classificação livre)

### 7.4 — Enviar o AAB para Teste Interno

1. Menu lateral → **"Testes" → "Teste interno"**
2. Clique em **"Criar nova versão"**
3. Em "App bundles", clique em **"Fazer upload"** e selecione o `.aab` baixado
4. Em "Notas da versão", escreva: "Primeira versão — Módulo 06 ITEAM"
5. Clique em **"Salvar"** e depois **"Revisar versão"**
6. Clique em **"Iniciar distribuição para Teste interno"**

### 7.5 — Adicionar testadores

1. Na aba **"Testadores"** do Teste interno
2. Clique em **"Criar lista de e-mails"**
3. Adicione os e-mails dos colegas que vão testar
4. Compartilhe o link de opt-in com eles

O app estará disponível para instalação em **minutos** (sem revisão da Google).

---

## Passo 8 — Publicar na App Store (iOS)

> ⚠️ **Requisitos antes de começar:**
> - **Conta Apple Developer** — USD 99/ano em [developer.apple.com/programs](https://developer.apple.com/programs). Diferente da Google (taxa única de USD 25), a Apple cobra anualmente.
> - **Build remoto via EAS** — não é necessário ter um Mac. O EAS Build compila o app nos servidores da Apple usando sua conta. Se quiser compilar localmente, precisará de um Mac com Xcode instalado.

---

### 8.1 — Configurar o `app.json` para iOS

Confirme que o `bundleIdentifier` está preenchido (já fizemos no Passo 1):

```json
"ios": {
  "supportsTablet": false,
  "bundleIdentifier": "com.seunome.minhasfinancas",
  "buildNumber": "1"
}
```

> O `bundleIdentifier` no iOS equivale ao `package` no Android — precisa ser único e nunca pode ser alterado após a publicação na App Store.

---

### 8.2 — Fazer login na Apple com o EAS

```bash
eas credentials --platform ios
```

O EAS vai pedir suas credenciais Apple Developer e criar automaticamente:
- **Certificado de distribuição** (assina o app)
- **Provisioning Profile** (autoriza a distribuição)

Selecione **"Let EAS manage credentials"** para deixar tudo automático.

---

### 8.3 — Gerar o build para iOS

**Para teste interno (sem Mac):**
```bash
eas build --platform ios --profile preview
```

**Para produção (App Store):**
```bash
eas build --platform ios --profile production
```

O build acontece nos servidores da Expo/Apple. Tempo estimado: **10 a 30 minutos**.

> O resultado é um arquivo `.ipa` — equivalente ao `.apk` do Android.

---

### 8.4 — Testar no iPhone sem a App Store (TestFlight)

O **TestFlight** é o programa oficial da Apple para distribuir apps em teste, sem passar pela revisão da loja.

1. Acesse [appstoreconnect.apple.com](https://appstoreconnect.apple.com)
2. Clique em **"Meus Apps"** → **"+"** → **"Novo app"**
3. Preencha:
   - Plataformas: iOS
   - Nome: Minhas Finanças
   - Idioma principal: Português (Brasil)
   - Bundle ID: selecione o criado no passo 8.2
4. Após criar, vá na aba **"TestFlight"**
5. Faça upload do `.ipa` via EAS:
   ```bash
   eas submit --platform ios
   ```
6. Aguarde a Apple processar o build (~15 min)
7. Adicione testadores pelo e-mail na aba **"Testadores Internos"**
8. Os testadores instalam o app pelo app **TestFlight** no iPhone

---

### 8.5 — Submeter para revisão da App Store

Quando o app estiver pronto para publicação pública:

1. No App Store Connect, vá em **"Distribuição" → "App Store"**
2. Clique em **"+"** ao lado de "Versão para iOS" e informe a versão ("1.0.0")
3. Preencha:
   - **Screenshots** obrigatórias: iPhone 6,5" e iPhone 5,5" (use o simulador no Xcode ou peça emprestado)
   - **Descrição**, palavras-chave, categoria (Finanças), classificação etária
4. Em "Build", selecione o build enviado via TestFlight
5. Clique em **"Enviar para revisão"**

> A revisão da Apple leva em média **1 a 3 dias úteis**. Apps simples costumam ser aprovados na primeira tentativa se seguirem as [diretrizes da App Store](https://developer.apple.com/app-store/review/guidelines/).

---

### Comparativo Android × iOS

| | Android (Google Play) | iOS (App Store) |
|---|---|---|
| Conta de desenvolvedor | USD 25 (taxa única) | USD 99/ano |
| Precisa de Mac para build? | Não | Não (com EAS Build) |
| Tempo de revisão | Horas a 1 dia | 1 a 3 dias úteis |
| Teste sem loja | APK direto | TestFlight |
| Formato do build | `.aab` (produção) / `.apk` (preview) | `.ipa` |
| Comando EAS | `eas build --platform android` | `eas build --platform ios` |

---

## Passo 9 — Atualizações OTA (bônus)

Se você corrigir um bug sem mudar código nativo, pode atualizar sem novo build.

### 9.1 — Publicar uma atualização OTA

```bash
# Certifique-se de que o eas update está configurado:
npx expo install expo-updates

# Publica a atualização:
eas update --branch production --message "Corrigido cálculo do saldo"
```

### 9.2 — Verificar a atualização

Os usuários receberão a atualização na próxima vez que abrirem o app.

---

## Resultado Final

| Entregável | Descrição |
|------------|-----------|
| `app.json` configurado | Nome, versão, ícone, splash, IDs únicos |
| `eas.json` criado | Perfis development, preview e production |
| APK de preview | Arquivo instalável para testes Android |
| App instalado no celular | Com ícone e nome corretos |
| (Opcional) Teste interno Android | Link compartilhável via Google Play |
| (Opcional) Build iOS via EAS | `.ipa` gerado sem precisar de Mac |
| (Opcional) TestFlight | Distribuição de teste para iPhone |

---

## Resolução de Problemas

### Erro de permissão ao instalar o eas-cli (`EACCES: permission denied`)
O `npm install -g` tenta escrever em pastas do sistema que exigem permissão de administrador. 
### "eas: command not found"
```bash
npm install -g eas-cli
# Se ainda não funcionar:
npx eas-cli build --platform android --profile preview
```

### "Android package name is already in use"
O `android.package` no `app.json` precisa ser único. Tente adicionar um número: `com.seunome.minhasfinancas2`

### O build falha com erro de keystore
```bash
eas credentials
# Selecione Android → Setup new keystore
```

### "Instalar apps desconhecidos" não aparece no Android
Vá em: Configurações → Apps → (menu de 3 pontos) → Acesso especial → Instalar apps desconhecidos → Selecione o gerenciador de arquivos → Permitir

### O ícone não aparece corretamente (borda branca ou cortado)
O ícone principal (`icon.png`) não pode ter transparência. Certifique-se de exportar do Canva **sem** fundo transparente. Para o `adaptive-icon.png`, transparência é esperada.

### O app não atualiza com eas update
Verifique se `expo-updates` está instalado:
```bash
npx expo install expo-updates
```
E se o `app.json` tem o `projectId` correto (gerado pelo `eas build:configure`).
