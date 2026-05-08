# Aula 01 — Introdução ao React Native

## Objetivos da Aula

Entender o que é React Native e sua arquitetura (Bridge/JavaScriptCore), configurar o ambiente com Expo CLI e criar o primeiro app mobile.

---

## Revisão dos Módulos Anteriores

React Native é a **evolução natural** da jornada Full Stack. Cada módulo anterior contribui diretamente:

| Módulo | Tema | Conexão com React Native |
|--------|------|--------------------------|
| M1 | Lógica de Programação | `map()`, `filter()`, eventos, manipulação de listas (FlatList) |
| M2 | Arquitetura da Informação | Hierarquia de componentes, estrutura de navegação |
| M3 | Web — HTML, CSS, JavaScript | ES6+, `async/await`, `fetch` — reutilizados diretamente |
| M4 | React (Front-end) ⚛️ | **~70% do conhecimento necessário** — componentes, hooks, JSX, props, state |
| M5 | Node.js e Express | APIs REST que o app vai consumir |

> **Mensagem-chave:** Se você domina React.js do Módulo 4, já tem 70% do caminho percorrido!

---

## O que é React Native?

React Native é uma biblioteca criada pela Meta (Facebook) que permite criar aplicativos móveis **nativos** para iOS e Android usando JavaScript e React.

### Por que "Native"?

Diferente de PWAs ou Cordova, o React Native **não usa webview**. O código JavaScript é convertido para componentes nativos reais:

- iOS → **UIView**, **UIButton**, etc. (Swift/Objective-C)
- Android → **ViewGroup**, **Button**, etc. (Kotlin/Java)

Resultado: performance próxima à de apps nativos puros.

---

## Arquitetura do React Native

O React Native funciona em **3 camadas**: JavaScript Layer, BRIDGE, Native Layer (iOS / Android)

### Como funciona na prática?

Você escreve:

```jsx
<View>
  <Text>Olá, ITEAM!</Text>
</View>
```

A Bridge:
1. Recebe a instrução do JavaScript
2. Serializa: `{ type: 'createView', props: {...} }`
3. Envia para a camada nativa
4. iOS cria um `UIView` com um `UILabel` dentro
5. Android cria um `ViewGroup` com um `TextView` dentro

**Analogia:** A Bridge é como um tradutor simultâneo trabalhando em segundo plano.

---

## React.js vs React Native

### O que MUDA (pequenas adaptações)

| React Web | React Native | Observação |
|-----------|--------------|------------|
| `<div>` | `<View>` | Container principal |
| `<span>` / `<p>` | `<Text>` | **Todo texto deve estar dentro de `<Text>`** |
| CSS (arquivo externo) | `StyleSheet.create({})` | Objeto JavaScript |
| `onClick` | `onPress` | Evento de toque |
| `import from 'react-dom'` | `import from 'react-native'` | Mudança de fonte |

---

## Configurando o Ambiente com Expo

**Por que Expo?** Expo simplifica drasticamente o setup. Você não precisa de Xcode ou Android Studio para começar — basta seu celular.

> **Aulas 1–3:** podem ser feitas inteiramente no [snack.expo.dev](https://snack.expo.dev) — sem instalar nada. Mesmo assim, **comece a instalar o ambiente local durante estas aulas**: a partir da Aula 4 ele se torna obrigatório.

### Softwares necessários

| Software | Versão | Download |
|---|---|---|
| Node.js | 20.x LTS | [nodejs.org](https://nodejs.org) |
| VS Code | qualquer recente | [code.visualstudio.com](https://code.visualstudio.com) |
| Git | 2.x | [git-scm.com](https://git-scm.com) |
| Android Studio | 2025.x | [developer.android.com/studio](https://developer.android.com/studio) |
| Expo Go (celular) | atual | [expo.dev/go](https://expo.dev/go) |

> **Atividade prática:** Siga o passo a passo em [conteúdo complementar](./STEPS.md) para criar e rodar o primeiro app durante a aula — do `create-expo-app` até o contador interativo com `useState`.

---

## SafeAreaView e ScrollView

Em celulares modernos o conteúdo pode ficar escondido atrás da barra de status, da "franjinha" (notch) ou da Dynamic Island. O `SafeAreaView` garante que tudo fique dentro da área visível:

```jsx
import { SafeAreaView, ScrollView } from 'react-native';

<SafeAreaView style={{ flex: 1, backgroundColor: '#f2f4f7' }}>
  <ScrollView contentContainerStyle={{ padding: 20 }}>
    {/* conteúdo aqui nunca fica escondido */}
  </ScrollView>
</SafeAreaView>
```

> **Detalhe importante:** o `ScrollView` tem duas props de estilo:
> - `style` → estiliza o "container" do scroll (a caixa externa)
> - `contentContainerStyle` → estiliza o conteúdo interno (padding, alinhamento)

Sem `ScrollView`, o conteúdo maior que a tela simplesmente é cortado.

---

## Composição de Estilos com Arrays

Você pode passar um **array** de estilos — o último tem prioridade sobre os anteriores. Isso permite criar variações sem duplicar código:

```jsx
// Base + variante condicional:
<TouchableOpacity
  style={[styles.botao, styles.botaoCinza]}  // ← array de estilos
  onPress={() => setContador(contador - 1)}
>
  <Text style={styles.botaoTexto}>−</Text>
</TouchableOpacity>
```

É equivalente a fazer `{ ...styles.botao, ...styles.botaoCinza }` — as propriedades do segundo objeto sobrescrevem as do primeiro.

---

## Dados Declarados Fora do Componente

Arrays e objetos **estáticos** (que nunca mudam) devem ser declarados fora da função do componente:

```jsx
// ✅ Fora do componente — criado uma única vez
const COMPARACOES = [
  { web: '<div>', nativo: '<View>' },
  { web: '<p>', nativo: '<Text>' },
];

export default function App() {
  // ✅ Dentro do componente — recriado a cada render
  const [contador, setContador] = useState(0);
  // ...
}
```

Se colocados dentro, o React recriaria o array a cada renderização — desperdício desnecessário. Dados que mudam ficam dentro (como `useState`); dados fixos ficam fora.

---

## Primeiro Componente Mobile

O primeiro componente usa `View`, `Text` e `StyleSheet` — a mesma estrutura de um componente React Web, com tags diferentes.

| Elemento | React Web | React Native |
|----------|-----------|--------------|
| Importação | `react-dom` | `react-native` |
| Container | `<div>` | `<View>` |
| Texto | `<p>`, `<span>` | `<Text>` |
| Estilos | arquivo CSS | `StyleSheet.create({})` |
| Estrutura do componente | igual | **igual** ✅ |

> O código completo (incluindo o contador com `useState` e a tabela de comparação) está no [conteúdo complementar](./STEPS.md).

---

## Estrutura do Projeto

```
MeuPrimeiroApp/
├── app/               # Telas (Expo Router)
│   └── index.tsx      # Tela inicial
├── assets/            # Imagens, fontes
├── components/        # Componentes reutilizáveis
├── app.json           # Configurações (nome, ícone, splash)
└── package.json       # Dependências
```

---

## Projeto Demo em Sala

O diretório `ola-iteam/` contém um projeto Expo pronto para rodar durante a aula.

### Como rodar

Siga as instruções completas em [conteúdo complementar](./STEPS.md) — o tutorial cobre desde a criação do projeto até a versão final com contador e tabela comparativa.

### O que o demo mostra

| Seção | Conceito demonstrado |
|-------|----------------------|
| Cabeçalho | `View`, `Text`, `StyleSheet` |
| Card Contador | `useState` + `onPress` + `TouchableOpacity` |
| Card Web → Mobile | `map()` em array, comparação visual de tags |
| Card Arquitetura | As 3 camadas do React Native visualmente |

### Estrutura do projeto demo

```
ola-iteam/
├── App.js          # Todo o código da demo (1 arquivo só)
├── app.json        # Configuração Expo
├── babel.config.js # Configuração do compilador
└── package.json    # Dependências
```

> O projeto inteiro está em **um único arquivo** (`App.js`) para facilitar a explicação em aula.

---

---


## Referências

- [Documentação oficial do React Native](https://reactnative.dev)
- [Documentação do Expo](https://docs.expo.dev)
- [Expo Go — Google Play](https://play.google.com/store/apps/details?id=host.exp.exponent)
- [Expo Go — App Store](https://apps.apple.com/app/expo-go/id982107779)
