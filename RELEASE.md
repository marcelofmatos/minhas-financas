# RELEASE.md — Versionamento Semântico (SemVer)

**Módulo 06 — Aula 03**
Prof. Marcelo Matos

> Este arquivo é um **guia prático** para os alunos sobre como versionar projetos no GitHub usando **Semantic Versioning (SemVer)**, com o exemplo real da release **`1.2.0`** deste repositório — a evolução natural a partir da `1.1.0` publicada na Aula 02.

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
> Ex.: `1.1.4` → ganhou nova feature → vira `1.2.0` (não `1.2.4`).

---

## Por que esta release é uma `1.2.0` (MINOR)?

A Aula 03 **adicionou funcionalidades** ao projeto sem quebrar a interface do usuário entregue na `1.1.0`:

- O saldo, os cards de resumo e a lista de transações continuam visíveis na nova tela `Dashboard` ✅
- Os componentes da Aula 02 (`CartaoSaldo`, `CardsResumo`, `ItemTransacao`) foram **reaproveitados**, não substituídos ✅
- Quem clonou na `1.1.0` consegue dar `git pull` na `1.2.0` e rodar `npm install` para ter a navegação ✅

Como **adicionamos features compatíveis** (várias telas + navegação), incrementamos o **MINOR** (`1.1.0` → `1.2.0`) e zeramos o PATCH.

> **Observação didática:** removemos a dependência `react-native-paper` (que não estava sendo usada de fato) e adicionamos as bibliotecas do React Navigation. Como **o comportamento visível ao usuário não quebra** e a documentação foi atualizada, mantemos como MINOR. Em projetos com API pública consumida por terceiros, trocar dependências assim seria candidato a MAJOR.

---

## Linha do tempo do projeto

| Versão  | Aula | Mudança principal                                                  | Tipo  |
| ------- | ---- | ------------------------------------------------------------------ | ----- |
| `1.0.0` | 01   | Primeira versão pública: cabeçalho + contador interativo           | —     |
| `1.1.0` | 02   | Tela principal: saldo, cards de resumo e lista de transações       | MINOR |
| `1.2.0` | **03** | **Navegação: Bottom Tabs + Stack, 6 telas e onboarding**         | **MINOR** |
| `1.2.1` | (futuro) | Correção de tab bar cortando ícones em iPhone com notch        | PATCH |
| `1.3.0` | 04   | Persistência local com `AsyncStorage`                              | MINOR |
| `2.0.0` | (futuro) | Migração para Expo SDK 55 (mudanças incompatíveis)            | MAJOR |

> **Antes da 1.0.0:** versões `0.x.y` indicam projeto em **desenvolvimento inicial**. A `1.0.0` sinaliza *"pronto para uso público"* — e é a partir dela que as regras de SemVer passam a valer com rigor.

---

## Como criar a release no GitHub

### 1. Criar a tag local e fazer push

```bash
git tag -a 1.2.0 -m "Aula 03 — Navegação com React Navigation"
git push origin 1.2.0
```

> A **tag** é um marcador permanente no commit. Diferente de uma branch, ela não se move.

### 2. Publicar a release

1. No GitHub, vá em **Releases** → **Draft a new release**
2. Em **Tag**, selecione `1.2.0`
3. Em **Target**, escolha `main` (ou `aula3`, conforme a estratégia da turma)
4. Em **Release title**, digite `1.2.0`
5. Em **Previous tag**, selecione `1.1.0` (para gerar o changelog automático com os commits desta aula)
6. Em **Release notes**, cole o conteúdo da próxima seção 👇
7. Clique em **Publish release**

---

## Conteúdo para colar nas Release notes (v1.2.0)

> Copie tudo o que está dentro do bloco abaixo e cole no campo **Release notes** do GitHub.

````markdown
## 🚀 1.2.0 — Aula 03: Navegação entre telas com React Navigation

Terceira release do projeto **minhas-financas**, marcando o fim da Aula 03 do Módulo 06. Esta versão transforma o app de uma única tela em um **aplicativo multi-tela com navegação por abas e pilha**, usando o React Navigation.

### ✨ Novas funcionalidades
- **Tela de boas-vindas** (`BoasVindasScreen`) exibida apenas no primeiro acesso, controlada por estado em `App.js`
- **Navegação por abas inferiores** (Bottom Tabs) com 4 áreas: Dashboard, Nova Transação, Relatório e Sobre
- **Navegação em pilha** (Stack) dentro do Dashboard, permitindo abrir o **detalhe de uma transação** ao tocar nela
- **Tela de cadastro de nova transação** (`NovaTransacaoScreen`) — placeholder pronto para a Aula 04
- **Tela de relatório** (`RelatorioScreen`) — placeholder para gráficos e totais
- **Tela "Sobre"** (`SobreScreen`) com informações do projeto e do curso
- **Ícones de aba dinâmicos** (Ionicons) que mudam entre estado ativo/inativo conforme a aba selecionada

### 📚 Conceitos demonstrados
- **React Navigation v7**: instalação, `NavigationContainer`, `createBottomTabNavigator` e `createNativeStackNavigator`
- **Navegadores aninhados**: um Stack dentro de uma Tab (Dashboard contém DashboardHome → DetalheTransacao)
- **`navigation.navigate('Tela', params)`** para mudar de tela e enviar parâmetros
- **`route.params`** para receber dados na tela de destino
- **`navigation.goBack()`** para voltar à tela anterior
- **`screenOptions`** para customizar headers, cores e estilos do tab bar
- **`SafeAreaProvider`** + `SafeAreaView` para respeitar áreas seguras (notch, status bar)
- **Estado de onboarding** em `App.js` com `useState` para mostrar `BoasVindasScreen` apenas uma vez por sessão
- **Organização em pastas**: separação clara entre `screens/` e `routes/`

### 🧩 Novos arquivos
- `routes/TabRoutes.js` — navegador de abas inferiores (Bottom Tabs)
- `routes/DashboardStack.js` — navegador em pilha dentro da aba Dashboard
- `screens/BoasVindasScreen.js` — tela de onboarding do primeiro acesso
- `screens/DashboardScreen.js` — tela principal (saldo + resumo + transações)
- `screens/DetalheTransacaoScreen.js` — detalhes de uma transação selecionada
- `screens/NovaTransacaoScreen.js` — formulário de cadastro (placeholder)
- `screens/RelatorioScreen.js` — relatórios (placeholder)
- `screens/SobreScreen.js` — informações do app e do curso

### ♻️ Mudanças no que já existia
- `App.js` foi **enxugado**: deixou de montar a UI diretamente e agora apenas decide entre `BoasVindasScreen` ou `NavigationContainer + TabRoutes`
- O conteúdo antigo do `App.js` foi movido para `screens/DashboardScreen.js`, mantendo o reuso dos componentes da Aula 02
- `app.json` atualizado com `name` e `slug` corretos para `minhas-financas`
- `index.js` ajustado (remoção de import desnecessário)

### 📦 Novas dependências
- `@react-navigation/native` — núcleo do React Navigation
- `@react-navigation/bottom-tabs` — navegador de abas inferiores
- `@react-navigation/native-stack` — navegador em pilha (versão nativa, mais performática)
- `react-native-safe-area-context` — gerenciamento de áreas seguras
- `react-native-screens` — otimização nativa das telas

### ➖ Dependências removidas
- `react-native-paper` — não estava sendo usado pelo código da Aula 02; removido para reduzir o tamanho do bundle

### 🛠️ Stack
- Expo SDK `~54.0.33`
- React `19.1.0`
- React Native `0.81.5`
- React Navigation `^7.x`

### 📖 Documentação
- [`README.md`](./README.md) — teoria da aula
- [`STEPS.md`](./STEPS.md) — tutorial passo a passo da Aula 03

**Full Changelog**: https://github.com/marcelofmatos/minhas-financas/compare/1.1.0...1.2.0
````

---

## Resumo visual — quando subir cada número

```
1.1.0 ──┬── corrigi bug ──────────► 1.1.1  (PATCH)
        │
        ├── adicionei feature ────► 1.2.0  ◄── ESTAMOS AQUI (Aula 03)
        │                            │
        │                            ├── corrigi bug ──► 1.2.1  (PATCH)
        │                            │
        │                            └── nova feature ──► 1.3.0  (MINOR — Aula 04)
        │
        └── compatibilidade mudou ─────────────────────► 2.0.0  (MAJOR)
```

---

## Referências

- [Semantic Versioning 2.0.0 (oficial)](https://semver.org/lang/pt-BR/)
- [Documentação do GitHub Releases](https://docs.github.com/pt/repositories/releasing-projects-on-github/managing-releases-in-a-repository)
- [Convenção de mensagens de commit](https://www.conventionalcommits.org/pt-br/)
- [React Navigation — documentação oficial](https://reactnavigation.org/)
