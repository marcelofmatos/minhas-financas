# RELEASE.md — Versionamento Semântico (SemVer)

**Módulo 06 — Aula 06**
Prof. Marcelo Matos

> Este arquivo é um **guia prático** para os alunos sobre como versionar projetos no GitHub usando **Semantic Versioning (SemVer)**, com o exemplo real da release **`1.5.0`** deste repositório — a evolução natural a partir da `1.4.0` publicada na Aula 05.

---

## Recapitulando — O que é Versionamento Semântico?

O **SemVer** ([semver.org](https://semver.org)) define como numerar versões de forma que **só de olhar o número**, qualquer pessoa entenda o tipo de mudança.

```
MAJOR.MINOR.PATCH
  │     │     │
  │     │     └── correção de bug (não muda comportamento)
  │     └──────── nova funcionalidade compatível
  └────────────── mudança que QUEBRA compatibilidade
```

| Parte | Quando aumentar |
|-------|-----------------|
| **MAJOR** (`X.0.0`) | Mudança que **quebra** o que já existia |
| **MINOR** (`0.X.0`) | Adicionar funcionalidade **sem quebrar** o que existe |
| **PATCH** (`0.0.X`) | **Corrigir um bug** sem alterar comportamento |

> **Regra de ouro:** quando incrementa um número à esquerda, os da direita **zeram**.
> Ex.: `1.4.2` → ganhou nova feature → vira `1.5.0` (não `1.5.2`).

---

## Por que esta release é uma `1.5.0` (MINOR)?

A Aula 06 **adicionou funcionalidades** ao projeto sem quebrar a estrutura entregue na `1.4.0`:

- Todas as telas e a navegação por Tabs (`Dashboard`, `NovaTransacao`, `Relatório`, `Sobre`) continuam funcionando exatamente como antes ✅
- A interface pública do `useTransacoes` (`transacoes`, `saldo`, `receitas`, `despesas`, `adicionarTransacao`, `removerTransacao`) **permanece a mesma** — os novos campos (`latitude`, `longitude`, `comprovante`) são opcionais e ignorados quando ausentes ✅
- O banco SQLite da `1.4.0` é **migrado automaticamente** ao iniciar o app: `PRAGMA table_info` detecta colunas faltantes e roda `ALTER TABLE` apenas se necessário — instalações existentes não perdem dados ✅
- A flag `@minhasfinancas:primeiro_acesso_concluido` no `AsyncStorage` continua respeitada ✅
- O `metro.config.js` da Aula 05 (resolução de `.wasm` para o Expo Web) segue intacto ✅

Como **adicionamos features compatíveis** (geolocalização, mapas cross-platform, câmera/galeria, comprovante na tela de detalhe e nova aba "Mapa"), incrementamos o **MINOR** (`1.4.0` → `1.5.0`) e zeramos o PATCH.

> **Observação didática:** o destaque arquitetural desta aula é a camada `MapaCompat` com extensões `.native.js` / `.web.js`. O mesmo código de tela funciona em Android, iOS **e** Web — no native via `react-native-maps`, no web via `react-leaflet` + OpenStreetMap. Em projetos que **expusessem** `react-native-maps` diretamente como contrato público, introduzir o adapter seria candidato a MAJOR. Aqui foi um detalhe interno: as telas (`MapaScreen`, `SeletorLocalMapa`) importam de `./MapaCompat`, então a abstração não vaza para fora.

---

## Linha do tempo do projeto

| Versão  | Aula     | Mudança principal                                                                  | Tipo      |
| ------- | -------- | ---------------------------------------------------------------------------------- | --------- |
| `1.0.0` | 01       | Primeira versão pública: cabeçalho + contador interativo                           | —         |
| `1.1.0` | 02       | Tela principal: saldo, cards de resumo e lista de transações                       | MINOR     |
| `1.2.0` | 03       | Navegação: Bottom Tabs + Stack, 6 telas e onboarding                               | MINOR     |
| `1.3.0` | 04       | Context API + AsyncStorage, cotações, Drawer e testes E2E                          | MINOR     |
| `1.4.0` | 05       | Armazenamento com SQLite + contexto de primeiro acesso persistido                  | MINOR     |
| `1.5.0` | **06**   | **Geolocalização, mapas cross-platform (RN-Maps + Leaflet) e câmera/comprovante**  | **MINOR** |
| `1.5.1` | (futuro) | Correção de pin sem ícone no Leaflet quando offline                                | PATCH     |
| `1.6.0` | 07       | Gráficos e relatórios visuais                                                      | MINOR     |
| `2.0.0` | (futuro) | Migração para Expo SDK 55 (mudanças incompatíveis)                                 | MAJOR     |

> **Antes da 1.0.0:** versões `0.x.y` indicam projeto em **desenvolvimento inicial**. A `1.0.0` sinaliza *"pronto para uso público"* — e é a partir dela que as regras de SemVer passam a valer com rigor.

---

## Como criar a release no GitHub

### 1. Criar a tag local e fazer push

```bash
git tag -a 1.5.0 -m "Aula 06 — Geolocalização, Mapas e Câmera"
git push origin 1.5.0
```

> A **tag** é um marcador permanente no commit. Diferente de uma branch, ela não se move.

### 2. Publicar a release

1. No GitHub, vá em **Releases** → **Draft a new release**
2. Em **Tag**, selecione `1.5.0`
3. Em **Target**, escolha `main` (ou `aula6`, conforme a estratégia da turma)
4. Em **Release title**, digite `1.5.0`
5. Em **Previous tag**, selecione `1.4.0` (para gerar o changelog automático com os commits desta aula)
6. Em **Release notes**, cole o conteúdo da próxima seção 👇
7. Clique em **Publish release**

---

## Conteúdo para colar nas Release notes (v1.5.0)

> Copie tudo o que está dentro do bloco abaixo e cole no campo **Release notes** do GitHub.

````markdown
## 🚀 1.5.0 — Aula 06: Geolocalização, Mapas e Câmera

Sexta release do projeto **minhas-financas**, marcando o fim da Aula 06 do Módulo 06. Esta versão habilita o app a **capturar onde** e **registrar com o quê** cada transação aconteceu: GPS via `expo-location`, mapa interativo via `react-native-maps` no celular e `react-leaflet` (OpenStreetMap) no navegador, e foto de comprovante via `expo-image-picker`. Destaque arquitetural: uma **camada de compatibilidade** com extensões `.native.js` / `.web.js` faz o **mesmo código de tela** rodar em Android, iOS e Web — sem `if (Platform.OS === 'web')` espalhado pelo projeto.

### ✨ Novas funcionalidades
- **Geolocalização das transações** — botão "Minha localização" usa o GPS (`requestForegroundPermissionsAsync` + `getCurrentPositionAsync`)
- **Escolha manual no mapa** — botão "Escolher no mapa" abre um modal (`SeletorLocalMapa`) onde o usuário toca para marcar o ponto
- **Tela de Mapa** com pins coloridos por tipo (verde para receita, vermelho para despesa) e `Callout` com descrição, valor e data ao tocar no pin
- **Comprovante fotográfico** — botões "Tirar foto" (câmera) e "Da galeria" via `expo-image-picker`, com preview e remoção
- **Foto do comprovante na tela de detalhe** dentro de um `ScrollView` (rola quando a imagem é grande)
- **Cross-platform de verdade**: `MapaCompat.native.js` re-exporta `react-native-maps`; `MapaCompat.web.js` reimplementa `MapView`/`Marker`/`Callout` com `react-leaflet` + tiles do OpenStreetMap (sem chave de API)
- **Migração automática do banco** — `PRAGMA table_info` detecta colunas faltantes e roda `ALTER TABLE` para adicionar `latitude`, `longitude` e `comprovante` em instalações que vieram da 1.4.0

### 📚 Conceitos demonstrados
- **Permissões nativas em React Native** — diferenças entre Foreground e Background, padrão do diálogo do SO
- **Níveis de precisão** do `expo-location` (`Lowest` → `BestForNavigation`) e o trade-off com bateria
- **API do `react-native-maps`** — `MapView`, `Marker`, `Callout tooltip`, `pinColor`, ref imperativo (`fitToCoordinates`)
- **Padrão Adapter / Compatibility Layer** — mesma API exposta, implementações diferentes por plataforma
- **Extensões de plataforma do Metro** — `.android.js`, `.ios.js`, `.native.js`, `.web.js` e a ordem de resolução
- **Câmera vs galeria** com `expo-image-picker` (`launchCameraAsync` × `launchImageLibraryAsync`), opções `quality`, `allowsEditing`, `aspect`
- **Por que `TEXT` e não `BLOB`** para a foto — guardar apenas a URI mantém o banco leve; padrão usado por WhatsApp, Telegram, etc.
- **Migração de schema com `PRAGMA table_info` + `ALTER TABLE`** — adicionar colunas sem perder dados
- **`ScrollView` com `flexGrow: 1`** em `contentContainerStyle` — diferença de `flex: 1` e por que importa
- **Armadilhas do Leaflet com bundlers** — `delete L.Icon.Default.prototype._getIconUrl` e CSS via CDN em vez de `import 'leaflet/dist/leaflet.css'`
- **Plugins do Expo no `app.json`** — `expo-location`, `expo-image-picker` (com `cameraPermission`)

### 🧩 Novos arquivos
- `hooks/useLocalizacao.js` — encapsula permissão + `getCurrentPositionAsync`
- `hooks/useComprovante.js` — encapsula câmera (`launchCameraAsync`) e galeria (`launchImageLibraryAsync`)
- `components/MapaCompat.native.js` — re-export de `react-native-maps` (Android/iOS)
- `components/MapaCompat.web.js` — implementação Leaflet+OpenStreetMap com a mesma API (`MapView`, `Marker`, `Callout`)
- `components/SeletorLocalMapa.js` — modal de seleção de local cross-platform (usa `MapaCompat`)
- `screens/MapaScreen.js` — tela "Mapa" com `MapView` + `Marker` + `Callout` (usa `MapaCompat`)

### ♻️ Mudanças no que já existia
- `database/db.js` — colunas opcionais `latitude REAL`, `longitude REAL`, `comprovante TEXT`; `INSERT` adaptado; migração automática via `PRAGMA table_info`
- `screens/NovaTransacaoScreen.js` — seções de Localização (GPS / mapa) e Comprovante (câmera / galeria) com preview e remoção; integração com `SeletorLocalMapa`
- `screens/DetalheTransacaoScreen.js` — exibe a linha "Local" quando há coordenadas e a foto do comprovante dentro de um `ScrollView` com `flexGrow: 1`
- `routes/TabRoutes.js` — aba **Mapa** adicionada entre Relatório e Sobre, com ícone `map`/`map-outline`
- `app.json` — `expo-location` e `expo-image-picker` (com `cameraPermission`) adicionados ao array `plugins`

### ➖ Removido
- Nada. Esta release é puramente aditiva.

### 📦 Novas dependências
- `expo-location` `~19.0.8` — acesso ao GPS
- `react-native-maps` `1.20.1` — mapa nativo no Android/iOS
- `expo-image-picker` `~17.0.11` — câmera e galeria
- `leaflet` `^1.9.4` — mapa interativo no navegador (web-only)
- `react-leaflet` `^5.0.0` — componentes React para Leaflet (web-only)

### 🛠️ Stack
- Expo SDK `~54.0.33`
- React `19.1.0`
- React Native `0.81.5`
- React Navigation `^7.x` (Native + Bottom Tabs + Native Stack + Drawer)
- AsyncStorage `2.2.0` (apenas para a flag de primeiro acesso)
- expo-sqlite `~16.0.10` (transações + colunas de localização e comprovante)
- expo-location `~19.0.8`, react-native-maps `1.20.1`, expo-image-picker `~17.0.11`
- leaflet `^1.9.4` + react-leaflet `^5.0.0` (mapa no Expo Web)
- Jest + Puppeteer (testes E2E — em revisão para a nova aba "Mapa")

### 🧪 Como rodar

```bash
# Android / iOS (Expo Go ou emulador)
npx expo start
# pressione `a` para Android, `i` para iOS

# Web (OpenStreetMap via Leaflet)
npx expo start --web

# Se o Expo Go não conectar (rede local restritiva):
npx expo start --tunnel
# ou via USB:
adb reverse tcp:8081 tcp:8081 && npx expo start
```

### 📖 Documentação
- [`README.md`](./README.md) — teoria da Aula 06 (permissões, GPS, `react-native-maps`, extensões `.native.js` / `.web.js`, câmera/galeria)
- [`STEPS.md`](./STEPS.md) — tutorial passo a passo da Aula 06 (12 passos)
- [`tests/README.md`](./tests/README.md) — como executar os testes E2E

**Full Changelog**: https://github.com/marcelofmatos/minhas-financas/compare/1.4.0...1.5.0
````

---

## Resumo visual — quando subir cada número

```
1.4.0 ──┬── corrigi bug ──────────► 1.4.1  (PATCH)
        │
        ├── adicionei feature ────► 1.5.0  ◄── ESTAMOS AQUI (Aula 06)
        │                            │
        │                            ├── corrigi bug ──► 1.5.1  (PATCH)
        │                            │
        │                            └── nova feature ──► 1.6.0  (MINOR — Aula 07)
        │
        └── compatibilidade mudou ─────────────────────► 2.0.0  (MAJOR)
```

---

## Referências

- [Semantic Versioning 2.0.0 (oficial)](https://semver.org/lang/pt-BR/)
- [Documentação do GitHub Releases](https://docs.github.com/pt/repositories/releasing-projects-on-github/managing-releases-in-a-repository)
- [Convenção de mensagens de commit](https://www.conventionalcommits.org/pt-br/)
- [`expo-location` — documentação oficial](https://docs.expo.dev/versions/latest/sdk/location/)
- [`expo-image-picker` — documentação oficial](https://docs.expo.dev/versions/latest/sdk/imagepicker/)
- [`react-native-maps` — documentação no GitHub](https://github.com/react-native-maps/react-native-maps)
- [`react-leaflet` — documentação oficial](https://react-leaflet.js.org/)
- [Leaflet — biblioteca JS de mapas](https://leafletjs.com/)
- [OpenStreetMap — tiles e licença](https://www.openstreetmap.org/)
- [Platform-specific code (React Native)](https://reactnative.dev/docs/platform-specific-code) — extensões `.native.js` / `.web.js`
- [`expo-sqlite` — `ALTER TABLE` e migrações](https://docs.expo.dev/versions/latest/sdk/sqlite/)
- [SQLite — sintaxe SQL](https://www.sqlite.org/lang.html)
