# RELEASE.md — Versionamento Semântico (SemVer)

**Módulo 06 — Aula 02**
Prof. Marcelo Matos

> Este arquivo é um **guia prático** para os alunos sobre como versionar projetos no GitHub usando **Semantic Versioning (SemVer)**, com o exemplo real da release **`1.1.0`** deste repositório — a evolução natural a partir da `1.0.0` publicada na Aula 01.

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
> Ex.: `1.0.7` → ganhou nova feature → vira `1.1.0` (não `1.1.7`).

---

## Por que esta release é uma `1.1.0` (MINOR)?

A Aula 02 **adicionou funcionalidades** ao projeto sem quebrar nada que já existia na `1.0.0`:

- O cabeçalho continua lá ✅
- A estrutura de projeto continua compatível ✅
- Quem clonou na `1.0.0` consegue dar `git pull` na `1.1.0` sem reescrever código ✅

Como **adicionamos features compatíveis**, incrementamos o **MINOR** (`1.0.0` → `1.1.0`) e zeramos o PATCH.

---

## Linha do tempo do projeto

| Versão  | Aula | Mudança principal                                                  | Tipo  |
| ------- | ---- | ------------------------------------------------------------------ | ----- |
| `1.0.0` | 01   | Primeira versão pública: cabeçalho + contador interativo           | —     |
| `1.1.0` | **02** | **Tela principal: saldo, cards de resumo e lista de transações** | **MINOR** |
| `1.1.1` | (futuro) | Correção de cor do saldo negativo em tema escuro              | PATCH |
| `1.2.0` | 03   | Formulário de cadastro de novas transações                         | MINOR |
| `1.3.0` | 04   | Persistência local com `AsyncStorage`                              | MINOR |
| `2.0.0` | (futuro) | Migração para Expo SDK 55 (mudanças incompatíveis)            | MAJOR |

> **Antes da 1.0.0:** versões `0.x.y` indicam projeto em **desenvolvimento inicial**. A `1.0.0` sinaliza *"pronto para uso público"* — e é a partir dela que as regras de SemVer passam a valer com rigor.

---

## Como criar a release no GitHub

### 1. Criar a tag local e fazer push

```bash
git tag -a 1.1.0 -m "Aula 02 — Tela principal com componentes"
git push origin 1.1.0
```

> A **tag** é um marcador permanente no commit. Diferente de uma branch, ela não se move.

### 2. Publicar a release

1. No GitHub, vá em **Releases** → **Draft a new release**
2. Em **Tag**, selecione `1.1.0`
3. Em **Target**, escolha `main`
4. Em **Release title**, digite `1.1.0`
5. Em **Previous tag**, selecione `1.0.0` (para gerar o changelog automático com os commits desta aula)
6. Em **Release notes**, cole o conteúdo da próxima seção 👇
7. Clique em **Publish release**

---

## Conteúdo para colar nas Release notes (v1.1.0)

> Copie tudo o que está dentro do bloco abaixo e cole no campo **Release notes** do GitHub.

````markdown
## 🚀 1.1.0 — Aula 02: Tela principal do minhas-financas

Segunda release do projeto **minhas-financas**, marcando o fim da Aula 02 do Módulo 06. Esta versão monta a **tela principal do app** com componentes reutilizáveis e um arquivo de tema centralizado.

### ✨ Novas funcionalidades
- **Card de saldo total** (`CartaoSaldo`) com cor dinâmica — verde se positivo, vermelho se negativo, e aviso visual quando o saldo fica negativo
- **Cards de resumo lado a lado** (`CardsResumo`) exibindo Receitas e Despesas com ícones do Ionicons
- **Lista de transações** (`ItemTransacao`) com ícone por categoria, descrição, data e valor formatado
- **Cálculo automático** de receitas, despesas e saldo a partir de uma lista de transações usando `.filter()` + `.reduce()`
- **Tema centralizado** (`theme.js`) com paleta de cores, espaçamentos e raios de borda padronizados

### 📚 Conceitos demonstrados
- **Componentização**: extração de componentes reutilizáveis em arquivos separados (`components/`)
- **Props**: passagem de dados de pai para filho (`saldo`, `receitas`, `despesas`, `descricao`, etc.)
- **Estilos dinâmicos**: composição via array (`[styles.valor, { color: ... }]`) e operador ternário
- **Renderização condicional**: `{!isPositivo && <Text>...</Text>}`
- **Listas com `.map()`** e a importância da prop `key`
- **Flexbox**: `flexDirection: 'row'`, `flex: 1` e `gap` para layouts lado a lado
- **Ícones vetoriais** com `@expo/vector-icons` e mapeamento categoria → ícone
- **`SafeAreaView`** para evitar sobreposição com a status bar
- **`ScrollView`** para conteúdo rolável
- **Sombras multiplataforma**: `shadowColor`/`shadowOffset` (iOS) + `elevation` (Android)
- **Operador `??`** (nullish coalescing) para fallback de ícone

### 🧩 Novos arquivos
- `theme.js` — paleta de cores e espaçamentos globais
- `components/CartaoSaldo.js` — card grande com saldo total
- `components/CardsResumo.js` — dois cards de receitas/despesas
- `components/ItemTransacao.js` — linha da lista de transações

### 📦 Novas dependências
- `react-native-paper` — biblioteca de componentes Material Design
- `react-dom` + `react-native-web` — suporte à execução no navegador
- `@expo/vector-icons` — já vinha com Expo (usado para ícones de categoria)

### 🛠️ Stack
- Expo SDK `~54.0.33`
- React `19.1.0`
- React Native `0.81.5`
- React Native Paper

### 📖 Documentação
- [`README.md`](./README.md) — teoria da aula
- [`STEPS.md`](./STEPS.md) — tutorial passo a passo da Aula 02

**Full Changelog**: https://github.com/marcelofmatos/minhas-financas/compare/1.0.0...1.1.0
````

---

## Resumo visual — quando subir cada número

```
1.0.0 ──┬── corrigi bug ──────────► 1.0.1  (PATCH)
        │
        ├── adicionei feature ────► 1.1.0  ◄── ESTAMOS AQUI (Aula 02)
        │                            │
        │                            ├── corrigi bug ──► 1.1.1  (PATCH)
        │                            │
        │                            └── nova feature ──► 1.2.0  (MINOR)
        │
        └── compatibilidade mudou ─────────────────────► 2.0.0  (MAJOR)
```

---

## Referências

- [Semantic Versioning 2.0.0 (oficial)](https://semver.org/lang/pt-BR/)
- [Documentação do GitHub Releases](https://docs.github.com/pt/repositories/releasing-projects-on-github/managing-releases-in-a-repository)
- [Convenção de mensagens de commit](https://www.conventionalcommits.org/pt-br/)
