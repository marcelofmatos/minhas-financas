# Aula 04 — APIs e Armazenamento

## Objetivos da Aula

Persistir dados com AsyncStorage, implementar CRUD completo, compartilhar estado global via Context API e gerenciar estados de carregamento e erro.

---

## Pré-Requisitos — Configure Antes de Começar

### Ambiente base (deve estar instalado)

| Item | Verificar com |
|---|---|
| Node.js 20.x | `node -v` |
| Expo CLI | `expo --version` |
| Android Studio + AVD rodando | `adb devices` — deve listar o emulador |
| Projeto `minhas-financas` das aulas anteriores | `npx expo start` + tecla `a` abre no emulador |

> Se o emulador não estiver configurado, siga o guia em [aula1/README.md](../aula1/README.md#configurando-o-android-studio-avd-emulador) **antes** de continuar.

### Pacotes novos — instalar no início da aula

Dentro da pasta `minhas-financas`, execute:

```bash
# Cliente HTTP (alternativa ao fetch)
npm install axios

# Armazenamento chave-valor persistente
npx expo install @react-native-async-storage/async-storage
```

> Use `npx expo install` (não `npm install`) para os pacotes Expo: ele garante a versão compatível com o seu SDK automaticamente.

### Ferramenta de teste de API

Instale uma das opções abaixo para testar endpoints antes de integrar no app:

| Ferramenta | Download | Ideal para |
|---|---|---|
| **Postman** | [postman.com/downloads](https://www.postman.com/downloads) | Explorar APIs com interface completa |
| **Insomnia** | [insomnia.rest/download](https://insomnia.rest/download) | Interface mais leve e rápida |
| **Thunder Client** | Extensão do VS Code | Quem prefere tudo dentro do editor |

---

## O Projeto desta Aula

Esta é a aula mais importante do módulo do ponto de vista prático: o **minhas-financas** passa de uma demonstração estática para um **app completamente funcional**.

| O que muda nesta aula |
|------------------------|
| Transações são **salvas no dispositivo** — persistem ao fechar e reabrir o app |
| O formulário da Aula 3 **realmente adiciona** transações à lista |
| É possível **excluir** transações |
| O saldo é **calculado em tempo real** a partir dos dados salvos |
| Um `ActivityIndicator` aparece enquanto os dados carregam |

---

## AsyncStorage — Armazenamento Local

O `AsyncStorage` é o equivalente mobile do `localStorage` do navegador: um banco de chave-valor simples que persiste os dados no dispositivo, mesmo após o app ser fechado.

### Instalação

```bash
npx expo install @react-native-async-storage/async-storage
```

### Como funciona

```
AsyncStorage
├── chave: '@minhasfinancas:transacoes'  →  valor: '[{"id":"1",...},{"id":"2",...}]'
├── chave: '@minhasfinancas:config'      →  valor: '{"moeda":"BRL"}'
└── ...
```

Os valores **sempre são strings** — objetos e arrays precisam ser convertidos com `JSON.stringify()` ao salvar e `JSON.parse()` ao ler.

### Uso básica

```jsx
import AsyncStorage from '@react-native-async-storage/async-storage';

// SALVAR:
await AsyncStorage.setItem('chave', JSON.stringify(dados));

// LER:
const json = await AsyncStorage.getItem('chave');
const dados = json ? JSON.parse(json) : null;

// REMOVER:
await AsyncStorage.removeItem('chave');

// LISTAR TODAS AS CHAVES:
const chaves = await AsyncStorage.getAllKeys();
```

> Todas as operações são **assíncronas** — sempre use `await` ou `.then()`.

---

## Context API — Estado Global

Nas aulas anteriores, as transações eram um estado local do `DashboardScreen`. O problema: quando a `NovaTransacaoScreen` adiciona uma transação, precisamos passar o dado "de volta" pelo `navigation.navigate` — funciona, mas é frágil.

A solução é o **Context API**: um estado global que qualquer tela pode ler ou modificar, sem precisar de props ou parâmetros de navegação.

### Analogia

Imagine um quadro de avisos no centro do escritório. Qualquer funcionário (componente) pode ler o quadro ou afixar um papel. Ninguém precisa entregar recados pessoalmente de um para o outro.

### Criando o contexto de transações

O `TransacoesContext` encapsula toda a lógica de persistência:

| Função | O que faz |
|--------|-----------|
| `carregarTransacoes()` | Lê as transações do AsyncStorage ao abrir o app |
| `adicionarTransacao(t)` | Adiciona ao estado + salva no AsyncStorage |
| `removerTransacao(id)` | Remove do estado + salva no AsyncStorage |
| `receitas`, `despesas`, `saldo` | Calculados automaticamente com `reduce()` |

Qualquer tela pode acessar o estado com o hook customizado:

```jsx
const { transacoes, saldo, receitas, despesas, carregando, removerTransacao } = useTransacoes();
```

> **Atividade prática:** O código completo de `TransacoesContext`, `DashboardScreen`, `NovaTransacaoScreen` e o hook de cotações está no [conteúdo complementar](./STEPS.md).

---

## Estados de Carregamento e Erro

Boas UX's sempre indicam ao usuário o que está acontecendo. Três estados importantes:

### Loading (carregando)

```jsx
import { ActivityIndicator } from 'react-native';

// Enquanto carrega, exibe o spinner:
if (carregando) {
  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <ActivityIndicator size="large" color="#2c3e50" />
      <Text style={{ marginTop: 12, color: '#555' }}>Carregando transações...</Text>
    </View>
  );
}
```

### Empty state (sem dados)

```jsx
// Quando não há transações:
if (transacoes.length === 0) {
  return (
    <View style={styles.vazio}>
      <Ionicons name="wallet-outline" size={64} color="#bdc3c7" />
      <Text style={styles.textoVazio}>Nenhuma transação ainda</Text>
      <Text style={styles.subtextoVazio}>Toque em "Nova Transação" para começar</Text>
    </View>
  );
}
```

### Tratamento de erro

```jsx
async function carregarTransacoes() {
  try {
    setCarregando(true);
    const json = await AsyncStorage.getItem(CHAVE);
    if (json) setTransacoes(JSON.parse(json));
  } catch (erro) {
    Alert.alert(
      'Erro',
      'Não foi possível carregar as transações. Tente novamente.',
      [{ text: 'Tentar novamente', onPress: carregarTransacoes }]
    );
  } finally {
    setCarregando(false);  // sempre executa, mesmo com erro
  }
}
```

---

## Excluir Transação com Confirmação

```jsx
import { Alert } from 'react-native';

function confirmarExclusao(id, descricao) {
  Alert.alert(
    'Excluir transação',
    `Deseja excluir "${descricao}"?`,
    [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Excluir',
        style: 'destructive',
        onPress: () => removerTransacao(id),
      },
    ]
  );
}

// No ItemTransacao, adicione onLongPress:
<TouchableOpacity
  onPress={onPress}
  onLongPress={() => confirmarExclusao(transacao.id, transacao.descricao)}
  style={styles.container}
>
```

---

## Custom Hooks — Reutilizando Lógica

Um **custom hook** é uma função que começa com `use` e encapsula lógica reutilizável com hooks do React. Ele permite separar lógica de negócio do componente visual:

O custom hook encapsula os três estados da requisição (`cotacoes`, `carregando`, `erro`) e expõe a função `atualizar` para o botão de refresh. O componente fica responsável apenas pela UI:

```jsx
const { cotacoes, carregando, erro, atualizar } = useCotacoes();
```

**Por que criar um custom hook em vez de colocar no componente?**

- O componente fica responsável apenas pela UI — sem lógica de fetch
- O hook pode ser reutilizado em qualquer outra tela
- Fica fácil de testar e depurar em isolamento

> O código completo de `useCotacoes` e `CartaoCotacoes` está no [conteúdo complementar](./STEPS.md).

---

## Consumindo uma API REST

Além do armazenamento local, apps reais consomem APIs externas. No minhas-financas, vamos buscar a cotação do dólar para exibir no dashboard como informação adicional.

### fetch vs Axios

Existem duas formas principais de fazer requisições HTTP no React Native:

| | `fetch` | Axios |
|---|---|---|
| Instalação | Nativo (não precisa instalar) | `npm install axios` |
| Verificação de erro HTTP | Manual (`if (!res.ok)`) | Automática (lança erro em 4xx/5xx) |
| Timeout | Manual | Nativo (`timeout: 5000`) |
| Interceptors | Não | Sim (útil para tokens JWT) |
| Transformação de JSON | Manual (`.json()`) | Automática (`res.data`) |

**Com `fetch` (nativo):**
```jsx
const resposta = await fetch('https://api.exemplo.com/dados');
if (!resposta.ok) throw new Error(`Erro: ${resposta.status}`);
const dados = await resposta.json();
```

**Com Axios (biblioteca):**
```jsx
import axios from 'axios';

// Instância configurada (boas práticas em projetos maiores):
const api = axios.create({
  baseURL: 'https://api.exemplo.com',
  timeout: 5000,
  headers: { 'Content-Type': 'application/json' },
});

// Requisição — sem precisar converter .json() manualmente:
const { data } = await api.get('/dados');

// POST com body:
const { data: nova } = await api.post('/transacoes', {
  descricao: 'Supermercado',
  valor: 150,
});
```

Para projetos simples como o minhas-financas, o `fetch` é suficiente. Use Axios quando o projeto crescer ou precisar de interceptors para autenticação.

### Exemplo

```jsx
// Usando a API pública gratuita, sem autenticação:
const URL_DOLAR = 'https://economia.awesomeapi.com.br/json/last/USD-BRL';

async function buscarCotacaoDolar() {
  try {
    const resposta = await fetch(URL_DOLAR);

    if (!resposta.ok) {
      throw new Error(`Erro HTTP: ${resposta.status}`);
    }

    const dados = await resposta.json();
    const cotacao = parseFloat(dados.USDBRL.bid);
    setCotacaoDolar(cotacao);
  } catch (erro) {
    console.warn('Não foi possível buscar cotação:', erro.message);
    // Não exibe erro para o usuário — é uma informação opcional
  }
}

useEffect(() => {
  buscarCotacaoDolar();
}, []);
```

---

## Projeto de demonstração em Sala

### Como rodar

```bash
cd minhas-financas
npx expo start
```

### O que é mostrado

| Funcionalidade | Conceito demonstrado |
|----------------|----------------------|
| Dados persistem ao fechar e abrir | AsyncStorage `setItem` / `getItem` |
| Spinner de carregamento | `ActivityIndicator` + estado `carregando` |
| Formulário salva de verdade | `adicionarTransacao()` via Context |
| Toque longo para excluir | `onLongPress` + `Alert.alert` confirmação |
| Tela vazia motivacional | Empty state com ícone |
| Cotação do dólar | `fetch` com API pública |

### Estrutura do projeto de demonstração

```
minhas-financas/
├── App.js
├── context/
│   └── TransacoesContext.js    # Estado global + AsyncStorage
├── routes/
│   └── TabRoutes.js
├── screens/
│   ├── DashboardScreen.js      # usa useTransacoes()
│   ├── NovaTransacaoScreen.js  # usa adicionarTransacao()
│   └── RelatorioScreen.js      # usa receitas, despesas, saldo
├── components/
│   ├── CartaoSaldo.js
│   ├── CardsResumo.js
│   └── ItemTransacao.js
└── theme.js
```

---

---


## Referências

- [AsyncStorage — documentação](https://react-native-async-storage.github.io/async-storage/)
- [Axios — documentação](https://axios-http.com/ptbr/docs/intro)
- [Context API — documentação React](https://react.dev/reference/react/createContext)
- [ActivityIndicator — React Native](https://reactnative.dev/docs/activityindicator)
- [API de cotações (gratuita)](https://docs.awesomeapi.com.br/api-de-moedas)
