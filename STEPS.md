# Passo a Passo — Criando Seu Primeiro App React Native

**Módulo 06 — Aula 01**  
Prof. Marcelo Matos

> Siga cada passo na ordem. Não pule etapas — cada uma prepara a próxima.  
> Se algo der errado, veja a seção **Resolução de Problemas** no final.

---

## O que você vai construir

Ao final deste tutorial, você terá um app funcionando no seu celular (ou emulador) com:

- Um cabeçalho com o nome da escola
- Um **contador interativo** com botões + e −
- Uma **tabela comparando** os componentes do React Web com os do React Native

Tudo isso em um único arquivo, em menos de 200 linhas de código.

---

## Antes de Começar — Checklist de Instalações

Antes de digitar qualquer comando, confirme que você tem o seguinte:

### 1. Node.js

O Node.js é o motor que executa o JavaScript fora do navegador. Precisamos dele para rodar o Expo.

**Como verificar:**

Abra o terminal e digite:

```bash
node -v
```

**O que deve aparecer:** algo como `v20.20.1` ou `v22.x.x`.

> **Onde fica o terminal?**
> - **Windows:** Pressione `Windows + R`, digite `cmd` e pressione Enter. Ou pesquise por "Prompt de Comando" no menu Iniciar.
> - **Mac:** Pressione `Cmd + Espaço`, pesquise "Terminal" e abra.
> - **Linux:** Pressione `Ctrl + Alt + T`.

Se aparecer `'node' não é reconhecido` ou `command not found`, o Node não está instalado:
1. Acesse https://nodejs.org
2. Clique no botão verde **LTS** (versão recomendada)
3. Baixe e instale normalmente
4. Feche e reabra o terminal
5. Execute `node -v` novamente

---

### 2. VS Code

O VS Code é o editor de código que usaremos para escrever o app.

**Como verificar:** Tente abrir o VS Code. Se não estiver instalado:
1. Acesse https://code.visualstudio.com
2. Clique em **Download for Windows/Mac/Linux**
3. Instale normalmente

**Extensão recomendada:** Após instalar o VS Code, abra-o, clique no ícone de extensões (4 quadrados no menu lateral esquerdo) e instale:
- **ES7+ React/Redux/React-Native snippets** — autocompleta código mais rápido

---

### 3. Expo Go (no seu celular)

O **Expo Go** é um app que permite ver seu projeto rodando no celular em tempo real, sem precisar publicar na loja.

- **Android (Google Play):** https://play.google.com/store/apps/details?id=host.exp.exponent
- **iPhone (App Store):** https://apps.apple.com/app/expo-go/id982107779

> Sem celular? Não tem problema — use o emulador Android. Veja as instruções na seção [Usando o Emulador Android](#usando-o-emulador-android) no final.

> **Importante:** Seu celular e seu computador precisam estar conectados na **mesma rede Wi-Fi** para o Expo Go funcionar.

---

## Passo 1 — Criar o Projeto

### 1.1 — Abra o terminal

Abra o terminal do seu sistema operacional (não dentro do VS Code por enquanto).

### 1.2 — Navegue até uma pasta conveniente

Vamos salvar o projeto na Área de Trabalho (Desktop). No terminal, digite:

**Windows:**
```bash
cd Desktop
```

**Mac/Linux:**
```bash
cd ~/Desktop
```

> O comando `cd` significa "Change Directory" — muda a pasta atual. É como clicar em uma pasta no Explorer/Finder, mas pelo teclado.

### 1.3 — Crie o projeto

```bash
npx create-expo-app ola-iteam --template blank
```

**O que cada parte desse comando faz:**

| Parte | Significado |
|-------|-------------|
| `npx` | Executa um programa sem precisar instalar antes |
| `create-expo-app` | Ferramenta oficial para criar projetos Expo |
| `ola-iteam` | Nome da pasta que será criada (e nome do app) |
| `--template blank` | Começa com o mínimo de código, sem extras |

**O que vai acontecer no terminal:**

O terminal vai mostrar mensagens de progresso enquanto baixa os arquivos necessários. Isso pode levar de 1 a 3 minutos dependendo da sua internet.

Quando terminar, você verá uma mensagem parecida com esta:

```
✅ Your project is ready!

To run your project, navigate to the directory and run one of the following npm commands.

- cd ola-iteam
- npm run android
- npm run ios
- npm run web
```

Se você viu essa mensagem — **o projeto foi criado com sucesso!**

---

## Passo 2 — Abrir no VS Code

### 2.1 — Entre na pasta do projeto

```bash
cd ola-iteam
```

> Agora você está dentro da pasta `ola-iteam`. Todo comando que você rodar a partir daqui vai acontecer dentro desse projeto.

### 2.2 — Abra o VS Code

```bash
code .
```

> O `.` (ponto) significa "a pasta atual". Esse comando diz ao VS Code: "abra a pasta que estou agora".

O VS Code vai abrir com o projeto carregado no painel esquerdo.

---

### Entendendo a estrutura do projeto

No painel esquerdo do VS Code (chamado de **Explorer**), você vai ver a seguinte estrutura:

```
ola-iteam/
│
├── node_modules/    ← Não mexa aqui. São as bibliotecas instaladas automaticamente.
│                      Pode ter milhares de arquivos — é normal.
│
├── assets/          ← Coloque aqui imagens, fontes e ícones do app.
│
├── App.js           ← ★ ESTE É O ARQUIVO QUE VAMOS EDITAR ★
│
├── app.json         ← Configurações do app: nome, ícone, splash screen.
│                      Não vamos mexer aqui hoje.
│
├── babel.config.js  ← Configuração do "tradutor" de código. Não precisa editar.
│
└── package.json     ← Lista de dependências e scripts do projeto.
```

> Foque no **App.js**. É o único arquivo que vamos modificar nessa aula.

---

## Passo 3 — Rodar o App pela Primeira Vez

### 3.1 — Inicie o servidor de desenvolvimento

No terminal (ainda dentro da pasta `ola-iteam`), execute:

```bash
npx expo start
```

> Se o terminal foi fechado, abra um novo e navegue de volta: `cd Desktop/ola-iteam`

O terminal vai exibir algo como:

```
Starting project at /Users/voce/Desktop/ola-iteam

› Metro waiting on exp://192.168.1.100:8081
› Scan the QR code above with Expo Go (Android) or the Camera app (iOS)

› Press a │ open Android
› Press w │ open web
› Press r │ reload app
› Press ? │ show all commands

[QR CODE APARECE AQUI]
```

### 3.2 — Veja o app no celular

**Android:**
1. Abra o app **Expo Go** no celular
2. Toque em **"Scan QR code"**
3. Aponte a câmera para o QR code no terminal
4. Aguarde carregar (pode levar 20-30 segundos na primeira vez)

**iPhone:**
1. Abra o app da **Câmera** nativa do iPhone
2. Aponte para o QR code
3. Toque na notificação que aparecer: "Abrir no Expo Go"

### 3.3 — O que você deve ver

A tela padrão do Expo com o texto:

> **"Open up App.js to start working on your app!"**

Essa é a tela inicial padrão. Vamos substituí-la completamente nos próximos passos.

---

### O que é o Hot Reload?

> **Dica importante:** Mantenha o terminal com o `npx expo start` rodando **durante todo o desenvolvimento**.
>
> Sempre que você **salvar o App.js** (`Ctrl+S`), o app vai atualizar automaticamente no celular ou emulador. Não precisa reiniciar nada. Isso se chama **Hot Reload** e é uma das grandes vantagens do desenvolvimento com Expo.

---

## Passo 4 — Entendendo o App.js Padrão

Clique no arquivo **App.js** no VS Code para abri-lo. Você verá este código:

```jsx
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View } from 'react-native';

export default function App() {
  return (
    <View style={styles.container}>
      <Text>Open up App.js to start working on your app!</Text>
      <StatusBar style="auto" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
```

Antes de modificar, vamos entender o que cada parte faz:

---

### As linhas de `import`

```jsx
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View } from 'react-native';
```

Isso importa os componentes que vamos usar. É como o `import` do React.js que você já conhece — a diferença é a **fonte**: aqui vem de `'react-native'` em vez de `'react-dom'`.

---

### O componente principal

```jsx
export default function App() {
  return (
    <View style={styles.container}>
      <Text>Open up App.js to start working on your app!</Text>
      <StatusBar style="auto" />
    </View>
  );
}
```

**Exatamente igual ao React.js!** É um componente funcional que retorna JSX. A única diferença são as tags:

| No React Web | No React Native | Por quê muda? |
|---|---|---|
| `<div>` | `<View>` | Renderiza um container nativo, não HTML |
| `<p>` ou `<span>` | `<Text>` | Renderiza texto nativo do sistema operacional |
| `onClick` | `onPress` | Evento de toque em vez de clique de mouse |

> **Regra importante:** Em React Native, **todo texto deve estar dentro de um componente `<Text>`**. Não funciona colocar texto diretamente dentro de `<View>`.

---

### Os estilos

```jsx
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
```

Isso é o equivalente ao CSS, mas escrito como um objeto JavaScript. As principais diferenças:

| CSS | StyleSheet (React Native) |
|-----|--------------------------|
| `background-color: #fff` | `backgroundColor: '#fff'` (camelCase) |
| Classes em arquivo `.css` | Objeto dentro do próprio arquivo `.js` |
| `px`, `em`, `%` | Apenas números (sem unidade) |

O `flex: 1` faz o container ocupar toda a tela disponível. `alignItems: 'center'` e `justifyContent: 'center'` centralizam o conteúdo — exatamente como o Flexbox do CSS.

---

## Passo 5 — Etapa 1: Olá, ITEAM!

Vamos substituir o conteúdo padrão pelo nosso app.

### 5.1 — Selecione tudo no App.js

No VS Code, com o **App.js** aberto:
1. Clique dentro do arquivo
2. Pressione **`Ctrl + A`** (Windows/Linux) ou **`Cmd + A`** (Mac) para selecionar tudo
3. Pressione **Delete** ou **Backspace** para apagar

### 5.2 — Cole o código abaixo

```jsx
import { View, Text, StyleSheet } from 'react-native';

export default function App() {
  return (
    <View style={styles.container}>
      <Text style={styles.titulo}>Olá, ITEAM! 🚀</Text>
      <Text style={styles.subtitulo}>Módulo 06 — Aula 01</Text>
      <Text style={styles.subtitulo}>Introdução ao React Native</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f2f4f7',
  },
  titulo: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#ff9500',
    marginBottom: 4,
  },
  subtitulo: {
    fontSize: 14,
    color: '#777',
  },
});
```

### 5.3 — Salve o arquivo

Pressione **`Ctrl + S`** (Windows/Linux) ou **`Cmd + S`** (Mac).

O app no celular vai atualizar automaticamente em 1-2 segundos.

---

### O que você deve ver agora

- Fundo cinza claro
- Texto **"Olá, ITEAM! 🚀"** em laranja, grande, no centro da tela
- Abaixo: "Módulo 06 — Aula 01" em cinza

---

### Entendendo o código novo

**Por que removemos o `import { StatusBar }`?**

Não vamos usar a `StatusBar` nessa versão. Em JavaScript/React, se você importar algo e não usar, pode receber um aviso. Por isso removemos o import.

**O que mudou nos estilos:**

```jsx
titulo: {
  fontSize: 32,       // tamanho da fonte (equivalente ao font-size no CSS)
  fontWeight: 'bold', // negrito
  color: '#ff9500',   // cor laranja (código hexadecimal)
  marginBottom: 4,    // espaço abaixo do texto (como margin-bottom no CSS)
},
```

**Por que `#ff9500`?** É o código da cor laranja. Você pode trocar por qualquer cor hexadecimal. Experimente `'#e74c3c'` (vermelho) ou `'#3498db'` (azul) e veja o resultado!

---

## Passo 6 — Etapa 2: Adicionando Interatividade com useState

Agora vamos adicionar um contador com botões. Isso vai provar que o `useState` funciona **exatamente igual** ao React.js — sem nenhuma modificação.

### 6.1 — Substitua todo o App.js

Selecione tudo (`Ctrl+A`), delete e cole:

```jsx
import { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

export default function App() {
  // useState — IDÊNTICO ao React.js ⚛️
  const [contador, setContador] = useState(0);

  return (
    <View style={styles.container}>

      {/* Cabeçalho */}
      <Text style={styles.titulo}>Olá, ITEAM! 🚀</Text>
      <Text style={styles.subtitulo}>Módulo 06 — Aula 01</Text>

      {/* Card do contador */}
      <View style={styles.card}>
        <Text style={styles.cardTitulo}>⚛️ useState — igual ao React.js</Text>

        {/* Número atual do contador */}
        <Text style={styles.contador}>{contador}</Text>

        {/* Linha de botões */}
        <View style={styles.botoes}>

          {/* Botão − (diminuir) */}
          <TouchableOpacity
            style={[styles.botao, styles.botaoCinza]}
            onPress={() => setContador(contador - 1)}
          >
            <Text style={styles.botaoTexto}>−</Text>
          </TouchableOpacity>

          {/* Botão Reset */}
          <TouchableOpacity
            style={[styles.botao, styles.botaoBranco]}
            onPress={() => setContador(0)}
          >
            <Text style={styles.botaoTextoReset}>Reset</Text>
          </TouchableOpacity>

          {/* Botão + (aumentar) */}
          <TouchableOpacity
            style={styles.botao}
            onPress={() => setContador(contador + 1)}
          >
            <Text style={styles.botaoTexto}>+</Text>
          </TouchableOpacity>

        </View>
      </View>

    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f2f4f7',
    padding: 20,
  },
  titulo: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#ff9500',
    marginBottom: 4,
  },
  subtitulo: {
    fontSize: 14,
    color: '#777',
    marginBottom: 24,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 14,      // cantos arredondados
    padding: 20,
    width: '100%',
    alignItems: 'center',
    elevation: 3,          // sombra no Android
    shadowColor: '#000',   // sombra no iOS
    shadowOpacity: 0.07,
    shadowRadius: 6,
  },
  cardTitulo: {
    fontSize: 15,
    fontWeight: '700',
    color: '#222',
    marginBottom: 16,
  },
  contador: {
    fontSize: 72,
    fontWeight: 'bold',
    color: '#ff9500',
    marginBottom: 16,
  },
  botoes: {
    flexDirection: 'row',  // coloca os botões lado a lado (como display:flex no CSS)
    gap: 12,               // espaço entre os botões
  },
  botao: {
    backgroundColor: '#ff9500',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 10,
    minWidth: 60,
    alignItems: 'center',
  },
  botaoCinza: {
    backgroundColor: '#555',
  },
  botaoBranco: {
    backgroundColor: '#eee',
  },
  botaoTexto: {
    color: '#fff',
    fontSize: 22,
    fontWeight: 'bold',
  },
  botaoTextoReset: {
    color: '#555',
    fontSize: 15,
    fontWeight: '600',
  },
});
```

### 6.2 — Salve e teste

Pressione `Ctrl+S`. Toque nos botões `+`, `−` e `Reset` no celular.

---

### Entendendo as novidades

**`useState`** — absolutamente igual ao React.js:

```jsx
const [contador, setContador] = useState(0);
//     ↑ valor    ↑ função para mudar   ↑ valor inicial
```

Quando você chama `setContador(contador + 1)`, o React atualiza o estado e redesenha a tela com o novo valor. Isso é reatividade — exatamente como você aprendeu no Módulo 4.

---

**`TouchableOpacity`** — o equivalente ao `<button>` do HTML:

```jsx
<TouchableOpacity onPress={() => setContador(contador + 1)}>
  <Text style={styles.botaoTexto}>+</Text>
</TouchableOpacity>
```

| React Web | React Native |
|-----------|--------------|
| `<button onClick={...}>` | `<TouchableOpacity onPress={...}>` |

Quando pressionado, o botão fica levemente transparente (daí o nome "Opacity"). Isso dá um feedback visual ao usuário de que o toque foi registrado.

---

**`flexDirection: 'row'`** — alinha os botões lado a lado:

```jsx
botoes: {
  flexDirection: 'row',  // ← bota os filhos em linha horizontal
  gap: 12,               // ← espaço de 12 pixels entre eles
},
```

> **Atenção — diferença importante!**  
> No CSS web, o padrão de `flexDirection` é `'row'` (horizontal).  
> No React Native, o padrão é **`'column'`** (vertical — de cima para baixo).  
> Por isso, quando queremos botões lado a lado, precisamos declarar explicitamente `flexDirection: 'row'`.

---

**`[styles.botao, styles.botaoCinza]`** — aplicando múltiplos estilos:

```jsx
style={[styles.botao, styles.botaoCinza]}
```

Quando você coloca os estilos em um **array**, o React Native funde os dois objetos. Propriedades do segundo sobrescrevem as do primeiro. É como combinar duas classes CSS no mesmo elemento.

---

## Passo 7 — Etapa 3: Lista com `.map()` e ScrollView

Agora vamos adicionar uma tabela comparando os componentes Web com os do React Native, usando o `.map()` — exatamente como você faria no React.js.

Também vamos adicionar o `ScrollView` para que a tela possa ser rolada quando o conteúdo for maior que a tela.

### 7.1 — Substitua todo o App.js

```jsx
import { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  SafeAreaView,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';

// ──────────────────────────────────────────────────────────
// Dados da tabela de comparação
// (declarados fora do componente — boa prática)
// ──────────────────────────────────────────────────────────
const COMPARACOES = [
  { web: '<div>',         nativo: '<View>' },
  { web: '<p> / <span>',  nativo: '<Text>' },
  { web: 'CSS',           nativo: 'StyleSheet' },
  { web: 'onClick',       nativo: 'onPress' },
  { web: 'react-dom',     nativo: 'react-native' },
];

export default function App() {
  const [contador, setContador] = useState(0);

  return (
    // SafeAreaView evita que o conteúdo fique atrás da
    // "franjinha" (notch) ou barra de status do celular
    <SafeAreaView style={styles.safe}>
      <StatusBar style="dark" />

      {/* ScrollView permite rolar a tela */}
      <ScrollView contentContainerStyle={styles.scroll}>

        {/* ── CABEÇALHO ──────────────────────────── */}
        <View style={styles.cabecalho}>
          <Text style={styles.titulo}>Olá, ITEAM! 🚀</Text>
          <Text style={styles.subtitulo}>Módulo 06 — Aula 01</Text>
          <Text style={styles.subtitulo}>Introdução ao React Native</Text>
        </View>

        {/* ── CARD 1: CONTADOR ───────────────────── */}
        <View style={styles.card}>
          <Text style={styles.cardTitulo}>⚛️  useState — igual ao React.js</Text>
          <Text style={styles.cardDescricao}>
            O mesmo hook que você usa no React Web funciona aqui sem nenhuma mudança.
          </Text>

          <Text style={styles.contador}>{contador}</Text>

          <View style={styles.botoes}>
            <TouchableOpacity
              style={[styles.botao, styles.botaoCinza]}
              onPress={() => setContador(contador - 1)}
            >
              <Text style={styles.botaoTexto}>−</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.botao, styles.botaoBranco]}
              onPress={() => setContador(0)}
            >
              <Text style={styles.botaoTextoReset}>Reset</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.botao}
              onPress={() => setContador(contador + 1)}
            >
              <Text style={styles.botaoTexto}>+</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* ── CARD 2: TABELA DE COMPARAÇÃO ──────── */}
        <View style={styles.card}>
          <Text style={styles.cardTitulo}>🔄  Web → Mobile</Text>
          <Text style={styles.cardDescricao}>
            Pequenas adaptações — a lógica permanece a mesma.
          </Text>

          {/* .map() funciona IGUAL ao React.js */}
          {COMPARACOES.map((item) => (
            <View key={item.web} style={styles.linha}>
              <View style={styles.coluna}>
                <Text style={styles.tag}>{item.web}</Text>
              </View>
              <Text style={styles.seta}>→</Text>
              <View style={styles.coluna}>
                <Text style={[styles.tag, styles.tagNativo]}>{item.nativo}</Text>
              </View>
            </View>
          ))}
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

// Constante de cor para reutilizar (evita repetição)
const LARANJA = '#ff9500';

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: '#f2f4f7',
  },
  scroll: {
    padding: 20,
    paddingBottom: 40,
  },
  cabecalho: {
    alignItems: 'center',
    marginBottom: 24,
    paddingTop: 12,
  },
  titulo: {
    fontSize: 32,
    fontWeight: 'bold',
    color: LARANJA,
    marginBottom: 4,
  },
  subtitulo: {
    fontSize: 14,
    color: '#777',
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 20,
    marginBottom: 16,
    elevation: 3,
    shadowColor: '#000',
    shadowOpacity: 0.07,
    shadowRadius: 6,
  },
  cardTitulo: {
    fontSize: 16,
    fontWeight: '700',
    color: '#222',
    marginBottom: 6,
  },
  cardDescricao: {
    fontSize: 13,
    color: '#666',
    marginBottom: 16,
    lineHeight: 18,
  },
  contador: {
    fontSize: 72,
    fontWeight: 'bold',
    color: LARANJA,
    textAlign: 'center',
    marginBottom: 16,
  },
  botoes: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 12,
  },
  botao: {
    backgroundColor: LARANJA,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 10,
    minWidth: 60,
    alignItems: 'center',
  },
  botaoCinza: { backgroundColor: '#555' },
  botaoBranco: { backgroundColor: '#eee' },
  botaoTexto: {
    color: '#fff',
    fontSize: 22,
    fontWeight: 'bold',
  },
  botaoTextoReset: {
    color: '#555',
    fontSize: 15,
    fontWeight: '600',
  },
  linha: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  coluna: {
    flex: 1,
    alignItems: 'center',
  },
  tag: {
    backgroundColor: '#f0f0f0',
    color: '#c0392b',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
    fontSize: 13,
    fontWeight: '600',
  },
  tagNativo: {
    backgroundColor: '#e8f4fd',
    color: '#2471a3',
  },
  seta: {
    fontSize: 18,
    color: '#aaa',
    marginHorizontal: 8,
  },
});
```

### 7.2 — Salve e teste

Role a tela para baixo e veja a tabela de comparação.

---

### Entendendo as novidades

**`SafeAreaView`** — evita sobreposição com a interface do celular:

```jsx
<SafeAreaView style={styles.safe}>
  {/* O conteúdo fica dentro da área segura da tela */}
</SafeAreaView>
```

Em celulares modernos com "franjinha" (notch) ou barra dinâmica (Dynamic Island no iPhone), o `SafeAreaView` garante que seu conteúdo não fique escondido atrás dessas áreas.

---

**`ScrollView`** — habilita a rolagem:

```jsx
<ScrollView contentContainerStyle={styles.scroll}>
  {/* Todo conteúdo aqui pode ser rolado */}
</ScrollView>
```

Sem o `ScrollView`, se o conteúdo for maior que a tela, ele simplesmente fica cortado e o usuário não consegue acessar o restante. Com ele, o usuário pode deslizar o dedo para ver tudo.

> **Detalhe:** o `ScrollView` tem duas props de estilo:
> - `style` → estiliza o próprio container do scroll (a "caixa")
> - `contentContainerStyle` → estiliza o conteúdo interno (o que está dentro)
>
> Usamos `contentContainerStyle` para dar `padding` ao conteúdo.

---

**`.map()` com `key`** — exatamente igual ao React.js:

```jsx
{COMPARACOES.map((item) => (
  <View key={item.web} style={styles.linha}>
    <Text>{item.web}</Text>
    <Text>{item.nativo}</Text>
  </View>
))}
```

O `key` é obrigatório quando renderizamos listas. Ele ajuda o React a identificar qual item mudou, foi adicionado ou removido. Use sempre um valor **único** para cada item — aqui usamos `item.web` porque cada elemento da Web tem um nome diferente.

---

**Dados declarados fora do componente:**

```jsx
const COMPARACOES = [
  { web: '<div>', nativo: '<View>' },
  ...
];
```

Declaramos o array `COMPARACOES` fora da função `App()` porque esses dados **nunca mudam**. Se colocássemos dentro, o React recriaria o array a cada renderização — desnecessário. Dados estáticos ficam fora; dados que mudam ficam dentro (como o `contador`).

---

## Passo 8 — Versão Final Completa

A versão final do projeto (na pasta `ola-iteam/App.js`) inclui **um card a mais**: a **Arquitetura em 3 camadas** do React Native, mostrando JavaScript Layer → Bridge → Native Layer de forma visual.

Você pode comparar com o que construiu e estudar as diferenças.

### Como ver a versão final

Se você seguiu esse tutorial dentro da pasta `ola-iteam` criada no **Passo 1**, o seu `App.js` está atualizado com o código do Passo 7.

Para ver a versão do professor com o card de Arquitetura:
1. Abra o arquivo `App.js` da pasta `ola-iteam` que o professor disponibilizou
2. O padrão é o mesmo: `CAMADAS.map(...)` gerando os blocos coloridos

---

## Resumo do que Você Aprendeu

| Conceito | React Web | React Native | É diferente? |
|----------|-----------|--------------|:---:|
| Componente funcional | `function App()` | `function App()` | Não |
| Estado com hook | `useState` | `useState` | Não |
| Loop em lista | `.map()` | `.map()` | Não |
| Comentários no JSX | `{/* ... */}` | `{/* ... */}` | Não |
| Container | `<div>` | `<View>` | Só o nome |
| Texto | `<p>`, `<span>` | `<Text>` | Só o nome |
| Clique / toque | `onClick` | `onPress` | Só o nome |
| Botão | `<button>` | `<TouchableOpacity>` | Só o nome |
| Rolar a página | nativo do browser | `<ScrollView>` | Sim |
| Estilos | arquivo `.css` | `StyleSheet.create({})` | Formato |
| Flexbox padrão | `row` (horizontal) | `column` (vertical) | Sim |
| Unidades CSS | `px`, `em`, `%` | apenas números | Sim |

---

## Resolução de Problemas Comuns

### "command not found: npx" ou "'npx' não é reconhecido"

O Node.js não está instalado ou não está no PATH do sistema.

**Solução:**
1. Baixe o Node.js em https://nodejs.org (versão LTS)
2. Instale e reinicie o computador
3. Abra um novo terminal e tente novamente

---

### O app não atualiza após salvar o arquivo

**Soluções, tente nessa ordem:**
1. Verifique se o arquivo foi salvo (`Ctrl+S`)
2. Pressione `r` no terminal onde o Expo está rodando
3. Agite o celular (literalmente) para abrir o menu do Expo → toque em **Reload**
4. Pare o servidor (`Ctrl+C` no terminal) e rode `npx expo start` novamente

---

### Erro: "Text strings must be rendered within a `<Text>` component"

Você colocou texto diretamente dentro de um `<View>` sem envolver em `<Text>`.

```jsx
// ❌ Errado — vai causar erro
<View>
  Olá
</View>

// ✅ Correto
<View>
  <Text>Olá</Text>
</View>
```

Procure no seu código onde há texto solto (sem `<Text>`) e corrija.

---

### Erro: "Unable to resolve module..." ou "Cannot find module..."

As dependências não foram instaladas corretamente.

**Solução:**
```bash
npm install
```

Execute isso dentro da pasta do projeto. Depois reinicie com `npx expo start`.

---

### O QR code não funciona / celular não conecta

Isso é problema de rede.

**Soluções:**
1. Certifique-se de que o **celular e o computador estão na mesma rede Wi-Fi**
2. **Desative qualquer VPN** no computador e no celular — VPNs bloqueiam a comunicação local entre dispositivos e causam erro de timeout
3. Se estiver em rede corporativa ou da escola, ela pode bloquear as conexões — use o hotspot do celular e conecte o computador nele
4. No terminal, pressione `s` para alternar o modo de conexão (tunnel)
5. Use `npx expo start --tunnel` — isso cria um túnel pela internet sem precisar da mesma rede

---

### "expo: command not found" ao rodar `expo start`

Você está usando o comando antigo. Use sempre:

```bash
npx expo start
```

(com `npx` na frente)

---

### Erro de sintaxe / tela vermelha no app

Uma tela vermelha com texto branco indica um erro no seu código JavaScript.

**O que fazer:**
1. Leia a mensagem de erro — ela indica a linha do problema
2. Verifique se todas as chaves `{` têm seu fechamento `}`
3. Verifique se todas as tags JSX estão fechadas: `<View>...</View>` ou `<Text />`
4. Verifique se todos os parênteses e colchetes estão balanceados
5. Compare seu código com o do tutorial linha por linha

---

## Usando o Emulador Android

Se você não tiver celular disponível, pode usar um celular virtual no computador.

### Passo 1 — Instalar o Android Studio

1. Acesse https://developer.android.com/studio
2. Clique em **Download Android Studio**
3. Instale normalmente (pode demorar — é um arquivo grande, ~1GB)

### Passo 2 — Criar um dispositivo virtual

1. Abra o **Android Studio**
2. Na tela inicial, clique em **More Actions** (ou abra qualquer projeto)
3. Clique em **Virtual Device Manager**
4. Clique no botão **+** ou **Create Device**
5. Escolha **Pixel 8** (ou qualquer outro) → clique em **Next**
6. Escolha a imagem do sistema: **Android 14 (API 34)** → clique em **Next**
7. Clique em **Finish**

### Passo 3 — Iniciar o emulador

1. No Virtual Device Manager, clique no botão ▶️ ao lado do dispositivo criado
2. Aguarde o celular virtual aparecer na tela (pode levar 1-2 minutos)

### Passo 4 — Conectar ao Expo

1. Com o emulador aberto e o `npx expo start` rodando no terminal, pressione a tecla **`a`**
2. O Expo vai instalar o app Expo Go automaticamente no emulador e abrir o projeto

---

**Parabéns por chegar até aqui! 🎉**

Você criou do zero um app React Native com estado interativo e lista dinâmica. Na próxima aula vamos explorar Flexbox mobile em profundidade e criar componentes reutilizáveis.
