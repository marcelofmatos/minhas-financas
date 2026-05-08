# RELEASE.md — Versionamento Semântico (SemVer)

**Módulo 06 — Aula 04**
Prof. Marcelo Matos

> Este arquivo é um **guia prático** para os alunos sobre como versionar projetos no GitHub usando **Semantic Versioning (SemVer)**, com o exemplo real da release **`1.3.0`** deste repositório — a evolução natural a partir da `1.2.0` publicada na Aula 03.

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
> Ex.: `1.2.4` → ganhou nova feature → vira `1.3.0` (não `1.3.4`).

---

## Por que esta release é uma `1.3.0` (MINOR)?

A Aula 04 **adicionou funcionalidades** ao projeto sem quebrar a estrutura entregue na `1.2.0`:

- A navegação por abas continua funcionando ✅
- As telas (`Dashboard`, `NovaTransacao`, `Relatorio`, `Sobre`) continuam acessíveis ✅
- Os componentes da Aula 02 (`CartaoSaldo`, `CardsResumo`, `ItemTransacao`) seguem em uso ✅
- Quem clonou na `1.2.0` consegue dar `git pull` na `1.3.0` e rodar `npm install` para ter persistência e cotações ✅

Como **adicionamos features compatíveis** (estado global, persistência, cotações, drawer e testes), incrementamos o **MINOR** (`1.2.0` → `1.3.0`) e zeramos o PATCH.

> **Observação didática:** removemos a `BoasVindasScreen` (que era um onboarding apenas em memória, não persistido). Como ela não era uma API consumida por terceiros e a UX principal continua intacta, mantemos como MINOR. Em projetos com fluxo de onboarding crítico, remover uma tela poderia ser candidato a MAJOR.

---

## Linha do tempo do projeto

| Versão  | Aula | Mudança principal                                                  | Tipo  |
| ------- | ---- | ------------------------------------------------------------------ | ----- |
| `1.0.0` | 01   | Primeira versão pública: cabeçalho + contador interativo           | —     |
| `1.1.0` | 02   | Tela principal: saldo, cards de resumo e lista de transações       | MINOR |
| `1.2.0` | 03   | Navegação: Bottom Tabs + Stack, 6 telas e onboarding               | MINOR |
| `1.3.0` | **04** | **Context API + AsyncStorage, cotações, Drawer e testes E2E**    | **MINOR** |
| `1.3.1` | (futuro) | Correção de race condition ao salvar transações no AsyncStorage | PATCH |
| `1.4.0` | 05   | Gráficos e relatórios visuais                                      | MINOR |
| `2.0.0` | (futuro) | Migração para Expo SDK 55 (mudanças incompatíveis)            | MAJOR |

> **Antes da 1.0.0:** versões `0.x.y` indicam projeto em **desenvolvimento inicial**. A `1.0.0` sinaliza *"pronto para uso público"* — e é a partir dela que as regras de SemVer passam a valer com rigor.

---

## Como criar a release no GitHub

### 1. Criar a tag local e fazer push

```bash
git tag -a 1.3.0 -m "Aula 04 — Context API, AsyncStorage, cotações e testes"
git push origin 1.3.0
```

> A **tag** é um marcador permanente no commit. Diferente de uma branch, ela não se move.

### 2. Publicar a release

1. No GitHub, vá em **Releases** → **Draft a new release**
2. Em **Tag**, selecione `1.3.0`
3. Em **Target**, escolha `main` (ou `aula4`, conforme a estratégia da turma)
4. Em **Release title**, digite `1.3.0`
5. Em **Previous tag**, selecione `1.2.0` (para gerar o changelog automático com os commits desta aula)
6. Em **Release notes**, cole o conteúdo da próxima seção 👇
7. Clique em **Publish release**

---

## Conteúdo para colar nas Release notes (v1.3.0)

> Copie tudo o que está dentro do bloco abaixo e cole no campo **Release notes** do GitHub.

````markdown
## 🚀 1.3.0 — Aula 04: Estado global, persistência local e cotações em tempo real

Quarta release do projeto **minhas-financas**, marcando o fim da Aula 04 do Módulo 06. Esta versão evolui o app de uma lista estática para uma aplicação com **estado global**, **persistência local** entre execuções, **cotações de moedas em tempo real** e **suíte de testes automatizados**.

### ✨ Novas funcionalidades
- **Estado global de transações** (`TransacoesContext`) — qualquer tela pode ler, adicionar ou remover transações
- **Persistência local com `AsyncStorage`** — as transações cadastradas continuam disponíveis após fechar e reabrir o app
- **Cadastro real de transações** na `NovaTransacaoScreen` — não é mais um placeholder; o formulário grava no contexto e persiste
- **Remover transação por toque longo** (`onLongPress` em `ItemTransacao`) na lista do Dashboard
- **Card de cotações de moedas** (`CartaoCotacoes`) consumindo API externa via hook `useCotacoes`
- **Navegação por Drawer** (gaveta lateral) envolvendo as Tabs, expandindo as opções de navegação
- **Suíte de testes E2E** com Jest + Puppeteer rodando contra a versão web do app, com relatórios em HTML

### 📚 Conceitos demonstrados
- **Context API**: `createContext`, `Provider`, `useContext` e como compartilhar estado sem prop drilling
- **`useEffect`** para carregar dados do `AsyncStorage` na inicialização e gravar a cada mudança
- **Custom Hooks**: criação do `useCotacoes` encapsulando `fetch` + `useState` + `useEffect`
- **`AsyncStorage`** (`@react-native-async-storage/async-storage`): `getItem`, `setItem`, serialização com `JSON.stringify`/`JSON.parse`
- **Consumo de API REST** com `fetch` e tratamento de loading/erro
- **`TouchableOpacity` com `onLongPress`** para gestos diferenciados de toque comum
- **Composição de Provider** envolvendo o navegador raiz para tornar o contexto disponível em todas as telas
- **Navegadores aninhados em três níveis**: Drawer → Tabs → Stack
- **Testes automatizados de UI** com Puppeteer simulando interações reais no navegador

### 🧩 Novos arquivos
- `context/TransacoesContext.js` — Provider e hook customizado para o estado global de transações
- `hooks/useCotacoes.js` — hook para buscar e atualizar cotações de moedas
- `components/CartaoCotacoes.js` — card visual exibindo as cotações
- `routes/DrawerRoutes.js` — navegador Drawer envolvendo as Tabs
- `tests/jest.config.js` — configuração do Jest com reporter HTML
- `tests/helpers.js` — utilitários compartilhados pelos testes (setup do Puppeteer, seletores)
- `tests/passo-8.1.test.js` — primeiro teste de fluxo (cadastro de transação)
- `tests/README.md` — instruções de como rodar a suíte de testes

### ♻️ Mudanças no que já existia
- `App.js` agora encapsula `TabRoutes` com `TransacoesProvider`, removendo a `BoasVindasScreen` e o estado de primeiro acesso
- `DashboardScreen` lê transações do contexto em vez do array local; recebe `onLongPress` em cada item para excluir
- `NovaTransacaoScreen` virou um formulário funcional que chama `adicionarTransacao` do contexto
- `RelatorioScreen` passou a calcular receitas/despesas a partir do contexto compartilhado
- `ItemTransacao` ganhou suporte a `onLongPress` (mantendo compatibilidade com o `onPress` existente)
- `TabRoutes` ajustado para integrar com o novo `DrawerRoutes`

### ➖ Removido
- `BoasVindasScreen` — onboarding inicial substituído por carregamento direto do app

### 📦 Novas dependências
- `@react-native-async-storage/async-storage` — armazenamento chave-valor assíncrono
- **Em `tests/package.json`** (devDependencies dedicadas para testes):
  - `jest` — framework de testes
  - `puppeteer` — automação de navegador
  - `jest-html-reporters` — geração de relatórios HTML

### 🛠️ Stack
- Expo SDK `~54.0.33`
- React `19.1.0`
- React Native `0.81.5`
- React Navigation `^7.x` (Native + Bottom Tabs + Native Stack + Drawer)
- AsyncStorage `2.2.0`
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
- [`README.md`](./README.md) — teoria da aula
- [`STEPS.md`](./STEPS.md) — tutorial passo a passo da Aula 04
- [`tests/README.md`](./tests/README.md) — como executar os testes E2E

**Full Changelog**: https://github.com/marcelofmatos/minhas-financas/compare/1.2.0...1.3.0
````

---

## Resumo visual — quando subir cada número

```
1.2.0 ──┬── corrigi bug ──────────► 1.2.1  (PATCH)
        │
        ├── adicionei feature ────► 1.3.0  ◄── ESTAMOS AQUI (Aula 04)
        │                            │
        │                            ├── corrigi bug ──► 1.3.1  (PATCH)
        │                            │
        │                            └── nova feature ──► 1.4.0  (MINOR — Aula 05)
        │
        └── compatibilidade mudou ─────────────────────► 2.0.0  (MAJOR)
```

---

## Referências

- [Semantic Versioning 2.0.0 (oficial)](https://semver.org/lang/pt-BR/)
- [Documentação do GitHub Releases](https://docs.github.com/pt/repositories/releasing-projects-on-github/managing-releases-in-a-repository)
- [Convenção de mensagens de commit](https://www.conventionalcommits.org/pt-br/)
- [React Navigation — documentação oficial](https://reactnavigation.org/)
- [AsyncStorage — documentação oficial](https://react-native-async-storage.github.io/async-storage/)
- [Jest](https://jestjs.io/) · [Puppeteer](https://pptr.dev/)
