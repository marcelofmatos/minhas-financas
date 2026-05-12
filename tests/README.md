# Testes E2E — minhas-financas

Suítes automatizadas que executam os roteiros de teste dos `STEPS.md` contra o app rodando no Expo Web, usando **Jest + Puppeteer**. Material didático: cada teste mapeia para um item do roteiro da aula correspondente.

---

## Estrutura

```
tests/
├── package.json                  # deps: jest, jest-html-reporters, puppeteer
├── jest.config.js                # reporters: default + jest-html-reporters
├── helpers.js                    # utilitários compartilhados (find-by-text, fiber, etc.)
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
npx jest aula5               # Aula 5 (passo 7.2)
npx jest aula5-passo-7.2     # mesma coisa, mais explícito
```

Relatórios HTML em `tests/reports/YYYY-MM-DDTHH-MM-report.html` após cada execução.

---

## Cobertura

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

Logo, no Expo Web, o fluxo `onLongPress → Alert.alert → botão "Excluir" → removerTransacao` **não completa pelo navegador**. Nenhum gesto sintético (touch, mouse hold, dispatch de pointer events) muda isso — a chamada `Alert.alert(...)` simplesmente não faz nada. No dispositivo real o `Alert.alert` funciona normalmente; a limitação é apenas do RN-web.

Para validar esse caminho sem o `Alert`, acessa-se o fiber do React: confere que o item tem `onLongPress` ligado e que o contexto expõe `removerTransacao`, e então chama-se `removerTransacao(id)` diretamente — equivalente a confirmar "Excluir" no celular. (Ver `helpers.excluirComToqueLongo`.)

**Solução adotada na Aula 5 (Passo 7):** a `DetalheTransacaoScreen` usa `if (Platform.OS === 'web') window.confirm(...)` em vez de `Alert.alert`. O `aula5-passo-7.2.test.js` instrumenta `window.confirm` para capturar a mensagem e controlar OK/Cancelar — não precisa de fiber para esse caminho.

### Persistência no Expo Web

- **AsyncStorage:** vai para `localStorage`. O helper `helpers.novaPagina` limpa a chave `@minhasfinancas:transacoes` ao abrir uma página nova.
- **Aula 5 (SQLite):** o `expo-sqlite` em modo web usa **WebAssembly** e armazena os dados em **IndexedDB**. O helper `novaPaginaLimpa` (inlined em `aula5-passo-7.2.test.js`) usa CDP `Storage.clearDataForOrigin` para zerar tudo (localStorage + IndexedDB + cookies) e tem fallback em JS.

### Tela de boas-vindas

- Na Aula 4 o `primeiroAcesso` é estado local em `App.js` (volta a `true` a cada reload). O helper `abrirApp` clica automaticamente no CTA.
- Na Aula 5 o `primeiroAcesso` vive em `AsyncStorage` (`@minhasfinancas:primeiro_acesso_concluido`). O teste da Aula 5 usa a opção `manterOnboarding: true` em `novaPaginaLimpa` para pular a tela.

---

## Simulando erros — material didático

Para ver o relatório HTML mostrando uma falha (útil em sala), aplique uma alteração que quebre o comportamento esperado, rode `npm test` e abra o `reports/...html`. Reverta depois com `git checkout <arquivo>`.

### Esquecer o `onLongPress` no Dashboard (teste 7 falha)

`screens/DashboardScreen.js`, dentro do `transacoes.map(...)`: comente a prop `onLongPress` do `<ItemTransacao>`. O teste `7. o toque longo na lista do Dashboard segue ativo como atalho` deixa de encontrar o handler no fiber e falha.

### Reverter qualquer simulação

```bash
cd minhas-financas
git checkout screens/DashboardScreen.js
npm test --prefix tests
```

Os testes devem voltar a passar.
