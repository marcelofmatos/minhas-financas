# Testes E2E — minhas-financas

Suítes automatizadas que executam os roteiros de teste dos `STEPS.md` contra o app rodando no Expo Web, usando **Jest + Puppeteer**. Material didático: cada teste mapeia para um item do roteiro da aula correspondente, e a seção [Simulando erros](#simulando-erros) ensina a fazer os testes falharem de propósito para ver regressões reais.

---

## Estrutura

```
tests/
├── package.json                  # deps: jest, jest-html-reporters, puppeteer
├── jest.config.js                # reporters: default + jest-html-reporters
├── helpers.js                    # utilitários compartilhados (find-by-text, fiber, etc.)
├── aula4-passo-8.1.test.js       # Aula 4 — roteiro 8.1 (AsyncStorage CRUD)
├── aula5-passo-7.2.test.js       # Aula 5 — roteiro 7.2 (Botão Excluir)
├── README.md                     # este arquivo
└── reports/
    └── YYYY-MM-DDTHH-MM-report.html
```

Convenção dos nomes: `aulaX-passoY.Z.test.js` — cada suite cobre um roteiro do `STEPS.md` da aula referida.

---

## Como rodar

Em **dois terminais**:

```bash
# Terminal 1 — sobe o Expo Web (porta padrão 8081)
cd minhas-financas && npx expo start --web

# Terminal 2 — roda todos os testes
cd minhas-financas/tests && npm test
```

### Variáveis de ambiente

| Variável     | Default                  | Efeito                                  |
| ------------ | ------------------------ | --------------------------------------- |
| `BASE_URL`   | `http://localhost:8081`  | URL do app (use se subir em outra porta)|
| `HEADLESS`   | `true`                   | `false` exibe o Chromium na tela        |

```bash
# Porta diferente + ver o browser:
BASE_URL=http://localhost:8082 HEADLESS=false npm test
```

### Rodar apenas uma aula ou um passo

```bash
npx jest aula4               # Aula 4 (passo 8.1)
npx jest aula5               # Aula 5 (passo 7.2)
npx jest aula5-passo-7.2     # mesma coisa, mais explícito
```

Relatórios HTML em `tests/reports/YYYY-MM-DDTHH-MM-report.html` após cada execução.

---

## Cobertura

### Aula 4 — `aula4-passo-8.1.test.js`

Suíte do passo 8.1 da Aula 4 (CRUD com AsyncStorage). Cada teste limpa o `localStorage` (equivalente ao AsyncStorage zerado) antes de rodar.

| Teste                                              | Sub-passos | O que valida                                                |
| -------------------------------------------------- | ---------- | ------------------------------------------------------------ |
| `1) Abre o app na tela vazia`                      | 1          | Empty state com ícone de carteira e instrução               |
| `2-5) Adiciona receita e despesa; saldo = 3050`    | 2, 3, 4, 5 | Formulário salva, lista atualiza, saldo é `receitas - despesas` |
| `6) Transações persistem após fechar/reabrir`      | 6          | `AsyncStorage.setItem` na adição, leitura no `useEffect`    |
| `7-8) Item tem onLongPress; remover esvazia lista` | 7, 8       | `onLongPress` ligado em `ItemTransacao`, `removerTransacao` apaga do estado e do storage |

### Aula 5 — `aula5-passo-7.2.test.js`

Roteiro do Passo 7.2 (Botão Excluir na tela de detalhe). Sete testes sequenciais — o `window.confirm` é instrumentado para capturar a mensagem e controlar a resposta. Os helpers específicos da Aula 5 (limpar IndexedDB do SQLite-Web, ler transações via fiber) estão inlined no próprio arquivo.

| Teste                                                                 | Item do roteiro | O que valida |
| --------------------------------------------------------------------- | --------------- | ------------ |
| `1. adicionar algumas transações de teste no app`                     | 1               | Adiciona 3 transações; confere no contexto via fiber |
| `2. tocar na transação abre o detalhe com o botão "Excluir"`          | 2               | Navegação para detalhe + botão visível |
| `3. tocar em "Excluir" exibe a confirmação com o nome da transação`   | 3               | `window.confirm` captura mensagem com o nome |
| `4. cancelar → Alert fecha e a transação continua na lista`           | 4               | `__confirmAnswer = false`; transação preservada |
| `5. confirmar exclusão → volta ao Dashboard e a transação sai da lista` | 5             | `__confirmAnswer = true`; remoção propaga |
| `6. fechar e reabrir o app (reload) — a exclusão persistiu no SQLite` | 6               | Reload mantém a exclusão no SQLite |
| `7. o toque longo na lista do Dashboard segue ativo como atalho`      | 7               | Fiber confirma `onLongPress` ainda wired-up |

---

## Detalhes técnicos relevantes

### `Alert.alert` no react-native-web é no-op

Verificado em `node_modules/react-native-web/src/exports/Alert/index.js`:

```js
class Alert {
  static alert() {}
}
```

Logo, no Expo Web, o fluxo `onLongPress → Alert.alert → botão "Excluir" → removerTransacao` **não completa pelo navegador**. Nenhum gesto sintético (touch, mouse hold, dispatch de pointer events) muda isso — a chamada `Alert.alert(...)` simplesmente não faz nada.

**Solução adotada em `aula4-passo-8.1.test.js` (teste 7-8):** acessar o fiber do React, validar que o item tem `onLongPress` ligado e que o contexto expõe `removerTransacao`, e então chamar `removerTransacao(id)` diretamente — equivalente a confirmar "Excluir" no celular. No dispositivo real o `Alert.alert` funciona normalmente; a limitação é apenas do RN-web.

**Solução adotada na Aula 5 (Passo 7):** a `DetalheTransacaoScreen` usa `if (Platform.OS === 'web') window.confirm(...)` em vez de `Alert.alert`. O `aula5-passo-7.2.test.js` instrumenta `window.confirm` para capturar a mensagem e controlar OK/Cancelar — não precisa de fiber para esse caminho.

### Persistência no Expo Web

- **Aula 4 (AsyncStorage):** vai para `localStorage`. `helpers.novaPagina` limpa a chave `@minhasfinancas:transacoes` antes de cada teste.
- **Aula 5 (SQLite):** o `expo-sqlite` em modo web usa **WebAssembly** e armazena os dados em **IndexedDB**. O helper `novaPaginaLimpa` (inlined em `aula5-passo-7.2.test.js`) usa CDP `Storage.clearDataForOrigin` para zerar tudo (localStorage + IndexedDB + cookies) e tem fallback em JS.

### Tela de boas-vindas

- Na Aula 4 o `primeiroAcesso` é estado local em `App.js` (volta a `true` a cada reload). O helper `abrirApp` clica automaticamente no CTA.
- Na Aula 5 o `primeiroAcesso` vive em `AsyncStorage` (`@minhasfinancas:primeiro_acesso_concluido`). O teste da Aula 5 usa a opção `manterOnboarding: true` em `novaPaginaLimpa` para pular a tela.

---

## Simulando erros — material didático da Aula 4

Para ver o relatório HTML mostrando uma falha (útil em sala), aplique uma das alterações abaixo no app, rode `npm test` e abra o `reports/...html`. Reverta depois com `git checkout <arquivo>`.

### Opção 1 — Quebrar a persistência (teste 6 falha)

Por que é didática: é exatamente o bug que motivou a Aula 4 — sem `AsyncStorage.setItem`, os dados somem ao fechar o app.

`context/TransacoesContext.js`, função `adicionarTransacao` (versão da Aula 4, antes do SQLite):

```js
async function adicionarTransacao(novaTransacao) {
  const atualizadas = [novaTransacao, ...transacoes];
  setTransacoes(atualizadas);
  // await AsyncStorage.setItem(CHAVE_STORAGE, JSON.stringify(atualizadas)); // ← comentado
}
```

**Resultado esperado no relatório:**

- ✓ 1) Abre o app na tela vazia
- ✓ 2-5) Adiciona receita e despesa; saldo = 3050
- ✗ **6) Transações persistem após fechar/reabrir** — `Expected length: 1, Received length: 0`
- ✓ 7-8) onLongPress + remover

### Opção 2 — Quebrar o cálculo do saldo (teste 2-5 falha)

`context/TransacoesContext.js`:

```js
const valor = {
  ...
  saldo: receitas + despesas,   // ← era receitas - despesas
  ...
};
```

**Resultado esperado:**

- ✗ **2-5) Adiciona receita e despesa; saldo = 3050** — `Expected: 3050, Received: 3350`

### Opção 3 — Esquecer o `onLongPress` (teste 7-8 falha)

`screens/DashboardScreen.js`, dentro do `transacoes.map(...)`:

```jsx
<ItemTransacao
  key={t.id}
  descricao={t.descricao}
  valor={t.valor}
  tipo={t.tipo}
  categoria={t.categoria}
  data={t.data}
  onPress={() => navigation.navigate('DetalheTransacao', { transacao: t })}
  // onLongPress={() => confirmarExclusao(t.id, t.descricao)}  ← comentado
/>
```

**Resultado esperado:**

- ✗ **7-8) Item tem onLongPress ligado; remover via contexto esvazia a lista e o storage** — `Falha ao acionar exclusão: sem_onLongPress`

---

## Como reverter qualquer simulação

```bash
cd minhas-financas
git checkout context/TransacoesContext.js screens/DashboardScreen.js
npm test --prefix tests
```

Os testes devem voltar a passar.
