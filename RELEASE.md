# RELEASE.md — Versionamento Semântico (SemVer)

**Módulo 06 — Aula 01**
Prof. Marcelo Matos

> Este arquivo é um **guia prático** para os alunos sobre como versionar projetos no GitHub usando **Semantic Versioning (SemVer)**, com o exemplo real da release **`1.0.0`** deste repositório.

---

## O que é Versionamento Semântico?

O **SemVer** é um padrão internacional ([semver.org](https://semver.org)) que define como numerar versões de software de forma que **só de olhar o número**, qualquer pessoa entenda o tipo de mudança.

O formato é sempre composto por **três números separados por ponto**:

```
MAJOR.MINOR.PATCH
  │     │     │
  │     │     └── correção de bug (não muda comportamento)
  │     └──────── nova funcionalidade compatível
  └────────────── mudança que QUEBRA compatibilidade
```

### Quando incrementar cada parte?

| Parte | Quando aumentar | Exemplo prático |
|-------|-----------------|-----------------|
| **MAJOR** (`X.0.0`) | Mudança que **quebra** o que já existia | Renomear `setContador` → `atualizarContador` (quebra apps que usavam o nome antigo) |
| **MINOR** (`0.X.0`) | Adicionar funcionalidade **sem quebrar** o que existe | Adicionar um botão **"Dobrar"** no contador (os botões antigos continuam funcionando) |
| **PATCH** (`0.0.X`) | **Corrigir um bug** sem alterar comportamento | Consertar o botão **"−"** que não estava decrementando |

> **Regra de ouro:** quando incrementa um número à esquerda, os da direita **zeram**.
> Ex.: `1.4.7` → ganhou nova feature → vira `1.5.0` (não `1.5.7`).

---

## Exemplo prático com este projeto

Imagine que **partimos da `1.0.0`** (release atual) e o projeto vai evoluir nas próximas aulas:

| Versão  | Mudança                                                      | Tipo  | Por quê?                                                     |
| ------- | ------------------------------------------------------------ | ----- | ------------------------------------------------------------ |
| `1.0.0` | Primeira versão pública: contador + cabeçalho                | —     | Marco inicial do projeto                                     |
| `1.0.1` | Corrige cor do botão Reset que estava ilegível em tema escuro | PATCH | Apenas correção visual, sem mudança de comportamento         |
| `1.1.0` | Adiciona tabela comparativa **Web → Mobile** com `.map()`    | MINOR | Nova feature; tudo que existia continua igual                |
| `1.2.0` | Adiciona card de **Arquitetura em 3 camadas** (JS → Bridge → Nativo) | MINOR | Nova feature aditiva                                         |
| `1.2.1` | Corrige `key` duplicada no `.map()` que gerava warning no console | PATCH | Bugfix, sem nova funcionalidade                              |
| `2.0.0` | Migra de **Expo SDK 54** para **Expo SDK 55** (mudanças incompatíveis) | MAJOR | Quem clonar precisa atualizar dependências — quebra compatibilidade |

> **Antes da 1.0.0:** versões `0.x.y` indicam que o projeto ainda está em **desenvolvimento inicial** e pode quebrar a qualquer momento. A `1.0.0` sinaliza: *"está pronto para uso público"*.

---

## Como criar a release no GitHub

### 1. Criar a tag local e fazer push

```bash
git tag -a 1.0.0 -m "Aula 01 — Introdução ao React Native"
git push origin 1.0.0
```

> A **tag** é um marcador permanente no commit. Diferente de uma branch, ela não se move.

### 2. Publicar a release

1. No GitHub, vá em **Releases** → **Draft a new release**
2. Em **Tag**, selecione `1.0.0`
3. Em **Target**, escolha `main`
4. Em **Release title**, digite `1.0.0`
5. Em **Release notes**, cole o conteúdo da próxima seção 👇
6. Clique em **Publish release**

---

## Conteúdo para colar nas Release notes (v1.0.0)

> Copie tudo o que está dentro do bloco abaixo e cole no campo **Release notes** do GitHub.

```markdown
## 🚀 1.0.0 — Aula 01: Introdução ao React Native

Primeira release pública do projeto **minhas-financas**, marcando o fim da Aula 01 do Módulo 06.

### ✨ Funcionalidades
- Cabeçalho com identidade visual da ITEAM
- Contador interativo com `useState` e botões `+` / `−` / **Reset**
- Estilização com `StyleSheet.create({})`
- Layout responsivo com Flexbox (`flexDirection: 'row'`, `gap`)
- Composição de estilos via array (`[styles.botao, styles.botaoCinza]`)

### 📚 Conceitos demonstrados
- Diferenças entre **React Web** e **React Native** (`<div>`→`<View>`, `<p>`→`<Text>`, `onClick`→`onPress`)
- Arquitetura em 3 camadas: **JavaScript → Bridge → Nativo**
- Configuração do ambiente com **Expo Go**
- Hot Reload e ciclo de desenvolvimento

### 🛠️ Stack
- Expo SDK `~54.0.33`
- React `19.1.0`
- React Native `0.81.5`

### 📖 Documentação
- [`README.md`](./README.md) — teoria da aula
- [`STEPS.md`](./STEPS.md) — tutorial passo a passo

**Full Changelog**: https://github.com/marcelofmatos/minhas-financas/commits/1.0.0
```

---

## Resumo visual — quando subir cada número

```
1.0.0 ──┬── corrigi bug ──────────► 1.0.1  (PATCH)
        │
        ├── adicionei feature ────► 1.1.0  (MINOR — zera o PATCH)
        │
        └── compatibilidade mudou ─────────► 2.0.0  (MAJOR — zera MINOR e PATCH)
```

---

## Referências

- [Semantic Versioning 2.0.0 (oficial)](https://semver.org/lang/pt-BR/)
- [Documentação do GitHub Releases](https://docs.github.com/pt/repositories/releasing-projects-on-github/managing-releases-in-a-repository)
- [Convenção de mensagens de commit](https://www.conventionalcommits.org/pt-br/)
