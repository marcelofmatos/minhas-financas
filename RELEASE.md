# RELEASE.md — Versionamento Semântico (SemVer)

**Módulo 06 — Aula 05**
Prof. Marcelo Matos

> Este arquivo é um **guia prático** para os alunos sobre como versionar projetos no GitHub usando **Semantic Versioning (SemVer)**, com o exemplo real da release **`1.4.0`** deste repositório — a evolução natural a partir da `1.3.0` publicada na Aula 04.

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
> Ex.: `1.3.2` → ganhou nova feature → vira `1.4.0` (não `1.4.2`).

---

## Por que esta release é uma `1.4.0` (MINOR)?

A Aula 05 **adicionou funcionalidades** ao projeto sem quebrar a estrutura entregue na `1.3.0`:

- A navegação por Drawer + Tabs e todas as telas (`Dashboard`, `NovaTransacao`, `Relatorio`, `Sobre`) continuam funcionando ✅
- O contrato público do `useTransacoes` (`transacoes`, `saldo`, `receitas`, `despesas`, `adicionarTransacao`, `removerTransacao`) **permanece o mesmo** — quem consome o hook não precisa mudar nada ✅
- A `BoasVindasScreen` está nesta versão agora controlada por contexto persistente em vez de `useState` em memória ✅
- Quem clonou na `1.3.0` consegue dar `git pull` na `1.4.0` e rodar `npm install` para ter o banco SQLite e o controle de primeiro acesso ✅

Como **adicionamos features compatíveis** (banco local com SQLite, contexto de primeiro acesso persistido e suporte a `.wasm` no bundler para o web), incrementamos o **MINOR** (`1.3.0` → `1.4.0`) e zeramos o PATCH.

> **Observação didática:** trocamos a persistência de transações de `AsyncStorage` para `SQLite`. Embora a *implementação interna* tenha mudado bastante (inclusive de assíncrono para síncrono), a *interface pública* do `TransacoesContext` foi preservada — por isso a release continua MINOR. Em projetos que **expusessem** as chaves do AsyncStorage como contrato público (ex.: lib usada por terceiros), essa troca seria candidata a MAJOR.

---

## Linha do tempo do projeto

| Versão  | Aula     | Mudança principal                                                     | Tipo      |
| ------- | -------- | --------------------------------------------------------------------- | --------- |
| `1.0.0` | 01       | Primeira versão pública: cabeçalho + contador interativo              | —         |
| `1.1.0` | 02       | Tela principal: saldo, cards de resumo e lista de transações          | MINOR     |
| `1.2.0` | 03       | Navegação: Bottom Tabs + Stack, 6 telas e onboarding                  | MINOR     |
| `1.3.0` | 04       | Context API + AsyncStorage, cotações, Drawer e testes E2E             | MINOR     |
| `1.4.0` | **05**   | **Armazenamento com SQLite + contexto de primeiro acesso persistido** | **MINOR** |
| `1.4.1` | (futuro) | Correção de erro ao excluir transação inexistente no SQLite           | PATCH     |
| `1.5.0` | 06       | Gráficos e relatórios visuais                                         | MINOR     |
| `2.0.0` | (futuro) | Migração para Expo SDK 55 (mudanças incompatíveis)                    | MAJOR     |

> **Antes da 1.0.0:** versões `0.x.y` indicam projeto em **desenvolvimento inicial**. A `1.0.0` sinaliza *"pronto para uso público"* — e é a partir dela que as regras de SemVer passam a valer com rigor.

---

## Como criar a release no GitHub

### 1. Criar a tag local e fazer push

```bash
git tag -a 1.4.0 -m "Aula 05 — Armazenamento com SQLite"
git push origin 1.4.0
```

> A **tag** é um marcador permanente no commit. Diferente de uma branch, ela não se move.

### 2. Publicar a release

1. No GitHub, vá em **Releases** → **Draft a new release**
2. Em **Tag**, selecione `1.4.0`
3. Em **Target**, escolha `main` (ou `aula5`, conforme a estratégia da turma)
4. Em **Release title**, digite `1.4.0`
5. Em **Previous tag**, selecione `1.3.0` (para gerar o changelog automático com os commits desta aula)
6. Em **Release notes**, cole o conteúdo da próxima seção 👇
7. Clique em **Publish release**

---

## Conteúdo para colar nas Release notes (v1.4.0)

> Copie tudo o que está dentro do bloco abaixo e cole no campo **Release notes** do GitHub.

````markdown
## 🚀 1.4.0 — Aula 05: Armazenamento com SQLite

Quinta release do projeto **minhas-financas**, marcando o fim da Aula 05 do Módulo 06. Esta versão troca a persistência local do app: as transações agora vivem em um **banco SQLite** (via `expo-sqlite`) com API síncrona, enquanto a flag de primeiro acesso passa a ser persistida em `AsyncStorage` por meio de um novo contexto dedicado.

### ✨ Novas funcionalidades
- **Banco de dados SQLite local** (`minhasfinancas.db`) para armazenar transações entre execuções
- **Operações CRUD síncronas** (`inicializarBanco`, `buscarTodasTransacoes`, `inserirTransacao`, `excluirTransacao`)
- **Contexto de primeiro acesso persistido** (`PrimeiroAcessoProvider`) — a `BoasVindasScreen` aparece **só uma vez por instalação**
- **Navegação condicional no `App.js`** via composição de Providers (welcome × app principal)
- **Suporte a arquivos `.wasm`** no bundler Metro (necessário para o SQLite no target web)
- **Estilização da `StatusBar`** integrada ao `SafeAreaView` no Dashboard
- **Funções bônus comentadas** em `database/db.js` para consultas avançadas (`buscarPorCategoria`, `totalPorTipo`, `buscarPorPeriodo`)

### 📚 Conceitos demonstrados
- Diferença entre **chave-valor (AsyncStorage)** e **banco relacional (SQLite)** — quando usar cada um
- **API síncrona** do `expo-sqlite` (`execSync`, `runSync`, `getAllSync`, `getFirstSync`) e por que ela não trava a UI
- SQL aplicado: `CREATE TABLE IF NOT EXISTS`, `INSERT`, `DELETE`, `SELECT … ORDER BY`, `WHERE`, `SUM`, `BETWEEN`
- **Composição de múltiplos contextos** com responsabilidades distintas (`PrimeiroAcessoProvider` × `TransacoesProvider`)
- **Carregamento assíncrono** com guard `if (carregando) return null` para evitar flash de UI
- **Migração de implementação** preservando a interface pública do hook (`useTransacoes`) — exemplo prático de SemVer
- Configuração do **Metro bundler** (`metro.config.js`) para resolver assets adicionais

### 🧩 Novos arquivos
- `database/db.js` — helper do banco SQLite (CRUD + funções bônus comentadas para consultas avançadas)
- `context/PrimeiroAcessoContext.js` — provider/hook que persiste o estado do onboarding em `AsyncStorage`
- `metro.config.js` — configuração do bundler para incluir `.wasm` em `assetExts`

### ♻️ Mudanças no que já existia
- `context/TransacoesContext.js` — agora usa `database/db.js` em vez de `AsyncStorage`; sem `async/await`
- `App.js` — extrai o estado de primeiro acesso para o `PrimeiroAcessoProvider`; renderização decidida pelo `ConteudoApp`
- `screens/DashboardScreen.js` — `SafeAreaView` ajustado e `StatusBar` estilizada
- `screens/RelatorioScreen.js` — título atualizado para **Maio 2026**
- `routes/TabRoutes.js` — pequeno ajuste de estilo na `tabBar`
- `components/CardsResumo.js`, `components/CartaoCotacoes.js`, `components/CartaoSaldo.js` — remoção de `marginTop` redundante após a reorganização do Dashboard

### ➖ Removido
- Uso direto do `AsyncStorage` para a **lista de transações** (substituído por SQLite). O `AsyncStorage` segue no projeto, mas agora apenas guarda a flag `@minhasfinancas:primeiro_acesso_concluido`
- `useState(true)` para primeiro acesso direto no `App.js` — substituído pelo provider

### 📦 Novas dependências
- `expo-sqlite` `~16.0.10` — banco SQLite embarcado para Expo / React Native

### 🛠️ Stack
- Expo SDK `~54.0.33`
- React `19.1.0`
- React Native `0.81.5`
- React Navigation `^7.x` (Native + Bottom Tabs + Native Stack + Drawer)
- AsyncStorage `2.2.0` (apenas para a flag de primeiro acesso)
- expo-sqlite `~16.0.10` (transações)
- Jest + Puppeteer (testes)

### 🧪 Como rodar os testes

```bash
# Em um terminal, inicie a versão web do app
npx expo start --web

# Em outro terminal
cd tests
npm install
npm test
```

Os relatórios HTML são gerados em `tests/reports/`.

### 📖 Documentação
- [`README.md`](./README.md) — teoria da Aula 05 (AsyncStorage × SQLite, API síncrona, consultas avançadas)
- [`STEPS.md`](./STEPS.md) — tutorial passo a passo da Aula 05
- [`tests/README.md`](./tests/README.md) — como executar os testes E2E

**Full Changelog**: https://github.com/marcelofmatos/minhas-financas/compare/1.3.0...1.4.0
````

---

## Resumo visual — quando subir cada número

```
1.3.0 ──┬── corrigi bug ──────────► 1.3.1  (PATCH)
        │
        ├── adicionei feature ────► 1.4.0  ◄── ESTAMOS AQUI (Aula 05)
        │                            │
        │                            ├── corrigi bug ──► 1.4.1  (PATCH)
        │                            │
        │                            └── nova feature ──► 1.5.0  (MINOR — Aula 06)
        │
        └── compatibilidade mudou ─────────────────────► 2.0.0  (MAJOR)
```

---

## Referências

- [Semantic Versioning 2.0.0 (oficial)](https://semver.org/lang/pt-BR/)
- [Documentação do GitHub Releases](https://docs.github.com/pt/repositories/releasing-projects-on-github/managing-releases-in-a-repository)
- [Convenção de mensagens de commit](https://www.conventionalcommits.org/pt-br/)
- [`expo-sqlite` — documentação oficial](https://docs.expo.dev/versions/latest/sdk/sqlite/)
- [SQLite — sintaxe SQL](https://www.sqlite.org/lang.html)
- [Metro — `metro.config.js` e `assetExts`](https://docs.expo.dev/guides/customizing-metro/)
- [AsyncStorage — documentação oficial](https://react-native-async-storage.github.io/async-storage/)
