# Aula 03 — Navegação e Rotas

## Objetivos da Aula

Configurar o React Navigation com Tab e Stack Navigators e passar dados entre telas com `navigation.navigate` e `route.params`.

---

## O Projeto desta Aula

Continuamos o **minhas-financas**. Ao final desta aula, o app terá:

| Aba | Tela | O que faz |
|-----|------|-----------|
| Dashboard | `DashboardScreen` | Saldo + lista de transações (Aula 2) |
| Nova Transação | `NovaTransacaoScreen` | Formulário para adicionar transação |
| Relatório | `RelatorioScreen` | Resumo visual de receitas e despesas |

---

## Por que precisamos de Navegação?

Apps reais têm múltiplas telas. Sem navegação, tudo precisaria ficar em um único arquivo — o que rapidamente se torna impossível de manter.

Três padrões de navegação mais comuns no mobile:

| Padrão | Exemplo | Componente |
|--------|---------|------------|
| Stack (pilha) | Detalhes → Editar → Salvar | `Stack.Navigator` |
| Tab (abas) | Dashboard / Perfil / Config | `Tab.Navigator` |
| Drawer (gaveta lateral) | Menu hamburguer | `Drawer.Navigator` |

No minhas-financas usaremos **Tab + Stack combinados**: abas na parte inferior e uma tela de formulário empilhada sobre o Dashboard.

---

## Instalação do React Navigation

### Passo a passo

```bash
# 1. Biblioteca principal de navegação
npm install @react-navigation/native

# 2. Dependências de gestos e animações
npx expo install react-native-screens react-native-safe-area-context

# 3. Navigator de abas inferiores
npm install @react-navigation/bottom-tabs

# 4. Navigator de pilha (para o formulário)
npm install @react-navigation/native-stack
```

> **Sobre o `react-native-safe-area-context`:** além de ser dependência do React Navigation, é dele que importaremos o `SafeAreaView` em todas as telas — o `SafeAreaView` do `react-native` está em vias de deprecação e só funciona corretamente no iOS. Para que o `SafeAreaView` funcione, o `App.js` precisa envolver tudo com `<SafeAreaProvider>`:
>
> ```jsx
> import { SafeAreaProvider } from 'react-native-safe-area-context';
>
> export default function App() {
>   return (
>     <SafeAreaProvider>
>       <NavigationContainer>{/* ... */}</NavigationContainer>
>     </SafeAreaProvider>
>   );
> }
> ```
>
> Nas telas, o uso fica:
>
> ```jsx
> import { SafeAreaView } from 'react-native-safe-area-context';
> ```

### Configuração básica

Todo app com React Navigation precisa de um `NavigationContainer` envolvendo tudo:

```jsx
// App.js
import { NavigationContainer } from '@react-navigation/native';

export default function App() {
  return (
    <NavigationContainer>
      {/* navegadores ficam aqui dentro */}
    </NavigationContainer>
  );
}
```

---

## Tab Navigator

O Tab Navigator cria a barra de abas na parte inferior da tela.

### Estrutura básica

```jsx
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';

const Tab = createBottomTabNavigator();

function TabRoutes() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: '#2ecc71',
        tabBarInactiveTintColor: '#95a5a6',
        tabBarStyle: {
          backgroundColor: '#fff',
          borderTopColor: '#eee',
          height: 60,
          paddingBottom: 8,
        },
        tabBarIcon: ({ color, size }) => {
          const icones = {
            Dashboard: 'home',
            'Nova Transação': 'add-circle',
            Relatório: 'bar-chart',
          };
          return <Ionicons name={icones[route.name]} size={size} color={color} />;
        },
      })}
    >
      <Tab.Screen name="Dashboard" component={DashboardScreen} />
      <Tab.Screen name="Nova Transação" component={NovaTransacaoScreen} />
      <Tab.Screen name="Relatório" component={RelatorioScreen} />
    </Tab.Navigator>
  );
}
```

### `screenOptions` — personalizando aparência

| Propriedade | O que faz |
|-------------|-----------|
| `headerShown: false` | Remove o cabeçalho automático |
| `tabBarActiveTintColor` | Cor do ícone/texto da aba ativa |
| `tabBarInactiveTintColor` | Cor das abas inativas |
| `tabBarStyle` | Estilo da barra inteira |
| `tabBarIcon` | Função que retorna o ícone |

---

## Stack Navigator

O Stack Navigator empilha telas. Quando você navega para uma nova tela, ela aparece por cima com uma animação. O botão de voltar remove a tela do topo da pilha.

```jsx
import { createNativeStackNavigator } from '@react-navigation/native-stack';

const Stack = createNativeStackNavigator();

function DashboardStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="DashboardMain"
        component={DashboardScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="DetalhesTransacao"
        component={DetalhesTransacaoScreen}
        options={{
          title: 'Detalhes',
          headerStyle: { backgroundColor: '#2c3e50' },
          headerTintColor: '#fff',
        }}
      />
    </Stack.Navigator>
  );
}
```

---

## Drawer Navigator

O Drawer Navigator cria um menu deslizante (gaveta) que abre a partir da lateral da tela — o padrão "hamburguer" usado em apps como Gmail e Google Maps.

### Instalação

```bash
npm install @react-navigation/drawer
npx expo install react-native-gesture-handler react-native-reanimated
```

> O `react-native-reanimated` exige que você adicione o plugin ao `babel.config.js`:

```js
// babel.config.js
module.exports = function(api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: ['react-native-reanimated/plugin'], // ← adicione esta linha
  };
};
```

Reinicie o servidor após alterar o `babel.config.js`: pressione `Ctrl+C` e execute `npx expo start` novamente.

### Estrutura básica

```jsx
import { createDrawerNavigator } from '@react-navigation/drawer';
import { Ionicons } from '@expo/vector-icons';

const Drawer = createDrawerNavigator();

function DrawerRoutes() {
  return (
    <Drawer.Navigator
      screenOptions={{
        drawerActiveTintColor: '#2c3e50',
        drawerInactiveTintColor: '#95a5a6',
        drawerStyle: { backgroundColor: '#f5f6fa', width: 260 },
      }}
    >
      <Drawer.Screen
        name="Dashboard"
        component={DashboardScreen}
        options={{
          drawerIcon: ({ color }) => <Ionicons name="home" size={22} color={color} />,
        }}
      />
      <Drawer.Screen
        name="Relatório"
        component={RelatorioScreen}
        options={{
          drawerIcon: ({ color }) => <Ionicons name="bar-chart" size={22} color={color} />,
        }}
      />
      <Drawer.Screen
        name="Configurações"
        component={ConfiguracoesScreen}
        options={{
          drawerIcon: ({ color }) => <Ionicons name="settings" size={22} color={color} />,
        }}
      />
    </Drawer.Navigator>
  );
}
```

### Abrindo e fechando a gaveta programaticamente

```jsx
function DashboardScreen({ navigation }) {
  return (
    <View>
      {/* Abre a gaveta ao tocar no ícone hamburguer: */}
      <TouchableOpacity onPress={() => navigation.openDrawer()}>
        <Ionicons name="menu" size={28} color="#fff" />
      </TouchableOpacity>

      {/* Também é possível fechar: */}
      <TouchableOpacity onPress={() => navigation.closeDrawer()}>
        <Text>Fechar menu</Text>
      </TouchableOpacity>

      {/* Ou alternar: */}
      <TouchableOpacity onPress={() => navigation.toggleDrawer()}>
        <Text>Alternar menu</Text>
      </TouchableOpacity>
    </View>
  );
}
```

### Combinando Drawer + Tab

O padrão mais comum em apps complexos é ter um Drawer na raiz e Tabs dentro de uma das telas:

```
Drawer.Navigator
├── Tela Principal (Tab.Navigator)
│   ├── Dashboard
│   ├── Nova Transação
│   └── Relatório
└── Configurações
```

```jsx
// App.js
export default function App() {
  return (
    <NavigationContainer>
      <DrawerRoutes />         {/* Drawer envolve tudo */}
    </NavigationContainer>
  );
}

// DrawerRoutes.js
function DrawerRoutes() {
  return (
    <Drawer.Navigator>
      <Drawer.Screen name="App" component={TabRoutes} />  {/* Tab dentro do Drawer */}
      <Drawer.Screen name="Configurações" component={ConfiguracoesScreen} />
    </Drawer.Navigator>
  );
}
```

| Quando usar Drawer | Quando usar Tab |
|--------------------|-----------------|
| Muitos itens de menu (5+) | Poucas telas principais (2–4) |
| Itens raramente acessados | Itens acessados com frequência |
| Apps estilo "painel de controle" | Apps estilo "redes sociais" |

---

## Navegando entre telas

Todo componente de tela recebe automaticamente a prop `navigation`:

```jsx
function DashboardScreen({ navigation }) {
  return (
    <View>
      <Button
        title="Ver detalhes da transação"
        onPress={() => navigation.navigate('DetalhesTransacao', {
          id: '123',
          descricao: 'Supermercado',
          valor: 280.50,
        })}
      />
      <Button title="Voltar" onPress={() => navigation.goBack()} />
    </View>
  );
}
```

### Recebendo parâmetros na tela destino

```jsx
function DetalhesTransacaoScreen({ route }) {
  // route.params contém o que foi passado no navigate()
  const { id, descricao, valor } = route.params;

  return (
    <View>
      <Text>{descricao}</Text>
      <Text>R$ {valor.toFixed(2)}</Text>
    </View>
  );
}
```

---

## Formulário de Nova Transação

A tela `NovaTransacaoScreen` precisa de campos de entrada de texto e seleção de categoria.

### TextInput — campo de texto

```jsx
import { TextInput } from 'react-native';

function NovaTransacaoScreen() {
  const [descricao, setDescricao] = useState('');
  const [valor, setValor] = useState('');

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Descrição</Text>
      <TextInput
        style={styles.input}
        value={descricao}
        onChangeText={setDescricao}
        placeholder="Ex: Supermercado"
        maxLength={50}
      />

      <Text style={styles.label}>Valor (R$)</Text>
      <TextInput
        style={styles.input}
        value={valor}
        onChangeText={setValor}
        placeholder="0,00"
        keyboardType="decimal-pad"  // abre teclado numérico
      />
    </View>
  );
}

const styles = StyleSheet.create({
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginBottom: 16,
    backgroundColor: '#fff',
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#555',
    marginBottom: 4,
  },
});
```

### Seleção de tipo (Receita / Despesa)

```jsx
function SeletorTipo({ tipo, onChange }) {
  return (
    <View style={styles.seletor}>
      <TouchableOpacity
        style={[styles.botaoTipo, tipo === 'receita' && styles.ativo_receita]}
        onPress={() => onChange('receita')}
      >
        <Ionicons name="arrow-up" size={18} color={tipo === 'receita' ? '#fff' : '#555'} />
        <Text style={[styles.textoTipo, tipo === 'receita' && { color: '#fff' }]}>Receita</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.botaoTipo, tipo === 'despesa' && styles.ativo_despesa]}
        onPress={() => onChange('despesa')}
      >
        <Ionicons name="arrow-down" size={18} color={tipo === 'despesa' ? '#fff' : '#555'} />
        <Text style={[styles.textoTipo, tipo === 'despesa' && { color: '#fff' }]}>Despesa</Text>
      </TouchableOpacity>
    </View>
  );
}
```

---

## Estrutura de Arquivos para Navegação

Projetos com navegação devem organizar as telas em uma pasta separada:

```
minhas-financas/
├── App.js                        # NavigationContainer + TabRoutes
├── routes/
│   └── TabRoutes.js              # Tab.Navigator com as 3 abas
├── screens/
│   ├── DashboardScreen.js        # Tela principal (Aula 2)
│   ├── NovaTransacaoScreen.js    # Formulário de nova transação
│   └── RelatorioScreen.js        # Resumo de receitas e despesas
├── components/                   # Componentes reutilizáveis (Aula 2)
├── theme.js
└── package.json
```

---

## Navegação Condicional

Apps reais mostram telas diferentes dependendo do estado do usuário — por exemplo: mostrar a tela de login se o usuário não estiver autenticado, ou o app principal se estiver.

### Conceito

Navegação condicional é controlada por **estado** (não por rotas). O `NavigationContainer` renderiza navegadores diferentes conforme uma condição:

```jsx
// App.js
import { useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';

export default function App() {
  const [autenticado, setAutenticado] = useState(false);

  return (
    <NavigationContainer>
      {autenticado
        ? <TabRoutes onLogout={() => setAutenticado(false)} />   // app principal
        : <AuthStack onLogin={() => setAutenticado(true)} />     // telas de login
      }
    </NavigationContainer>
  );
}
```

### Stack de autenticação

```jsx
import { createNativeStackNavigator } from '@react-navigation/native-stack';

const Stack = createNativeStackNavigator();

function AuthStack({ onLogin }) {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Login">
        {(props) => <LoginScreen {...props} onLogin={onLogin} />}
      </Stack.Screen>
      <Stack.Screen name="Cadastro" component={CadastroScreen} />
      <Stack.Screen name="EsqueciSenha" component={EsqueciSenhaScreen} />
    </Stack.Navigator>
  );
}

function LoginScreen({ navigation, onLogin }) {
  return (
    <View style={{ flex: 1, justifyContent: 'center', padding: 24 }}>
      <Text style={{ fontSize: 28, fontWeight: 'bold', marginBottom: 32 }}>Entrar</Text>

      <TouchableOpacity
        style={{ backgroundColor: '#2c3e50', padding: 16, borderRadius: 8, alignItems: 'center' }}
        onPress={onLogin}  // chama o callback — troca o navegador no App.js
      >
        <Text style={{ color: '#fff', fontSize: 16, fontWeight: '700' }}>Acessar</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={{ marginTop: 16, alignItems: 'center' }}
        onPress={() => navigation.navigate('Cadastro')}
      >
        <Text style={{ color: '#2c3e50' }}>Não tem conta? Cadastre-se</Text>
      </TouchableOpacity>
    </View>
  );
}
```

### Persistindo o estado de autenticação

Na prática, o estado `autenticado` precisa ser carregado do AsyncStorage ao abrir o app, para que o usuário não precise fazer login toda vez:

```jsx
import { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function App() {
  const [autenticado, setAutenticado] = useState(false);
  const [verificando, setVerificando] = useState(true); // evita flash da tela errada

  useEffect(() => {
    async function verificarSessao() {
      const token = await AsyncStorage.getItem('@app:token');
      setAutenticado(!!token);
      setVerificando(false);
    }
    verificarSessao();
  }, []);

  if (verificando) {
    return <SplashScreen />; // mostra splash enquanto verifica
  }

  return (
    <NavigationContainer>
      {autenticado
        ? <TabRoutes onLogout={async () => {
            await AsyncStorage.removeItem('@app:token');
            setAutenticado(false);
          }}
          />
        : <AuthStack onLogin={async (token) => {
            await AsyncStorage.setItem('@app:token', token);
            setAutenticado(true);
          }}
          />
      }
    </NavigationContainer>
  );
}
```

> **Por que não usar `navigation.navigate('Login')` para fazer logout?** Porque as telas de login e do app principal são navegadores separados — não há como navegar entre eles. A troca é feita alterando o **estado** no `App.js`, e o React re-renderiza o navegador correto automaticamente.

---

## KeyboardAvoidingView — Teclado que Cobre Campos

Em dispositivos iOS (e alguns Android), o teclado virtual pode cobrir campos de formulário. O `KeyboardAvoidingView` evita isso:

```jsx
import { KeyboardAvoidingView, Platform } from 'react-native';

<KeyboardAvoidingView
  behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
  style={{ flex: 1 }}
>
  <ScrollView keyboardShouldPersistTaps="handled">
    <TextInput placeholder="Descrição" />
    <TextInput placeholder="Valor" keyboardType="decimal-pad" />
  </ScrollView>
</KeyboardAvoidingView>
```

| `behavior` | Efeito | Recomendado para |
|------------|--------|-----------------|
| `'padding'` | Adiciona espaço abaixo do campo | iOS |
| `'height'` | Reduz a altura do container | Android |
| `'position'` | Reposiciona o container | Casos especiais |

A prop `keyboardShouldPersistTaps="handled"` no `ScrollView` garante que tocar fora do teclado não desmonte os campos antes do `onPress` ser processado.

---

## Recebendo Dados via route.params com useEffect

Ao usar `navigation.navigate('Dashboard', { novaTransacao })` para passar dados de volta, a tela destino precisa de um `useEffect` para reagir à mudança:

```jsx
function DashboardScreen({ navigation, route }) {
  const [transacoes, setTransacoes] = useState(INICIAIS);

  // Reage sempre que route.params?.novaTransacao mudar
  useEffect(() => {
    if (route.params?.novaTransacao) {
      setTransacoes(prev => [route.params.novaTransacao, ...prev]);
    }
  }, [route.params?.novaTransacao]);
  // ...
}
```

> **Por que useEffect e não verificar direto no render?** Porque os parâmetros podem chegar depois da primeira renderização. O `useEffect` com a dependência correta garante que o código execute apenas quando o valor realmente mudar.

---

## Passando Callback entre Telas

Na Aula 4 usaremos Context API, mas por enquanto podemos passar uma função de callback pelo `navigate`:

```jsx
// DashboardScreen — passa função para receber nova transação
function DashboardScreen({ navigation }) {
  const [transacoes, setTransacoes] = useState(TRANSACOES_INICIAIS);

  const adicionarTransacao = (novaTransacao) => {
    setTransacoes(prev => [novaTransacao, ...prev]);
  };

  return (
    <View>
      <Button
        title="+ Nova"
        onPress={() => navigation.navigate('Nova Transação', { onSalvar: adicionarTransacao })}
      />
      {/* lista de transacoes... */}
    </View>
  );
}

// NovaTransacaoScreen — chama o callback ao salvar
function NovaTransacaoScreen({ route, navigation }) {
  const { onSalvar } = route.params ?? {};

  const salvar = () => {
    const novaTransacao = { id: Date.now().toString(), descricao, valor: parseFloat(valor), tipo, categoria };
    onSalvar?.(novaTransacao);   // chama o callback se existir
    navigation.goBack();         // volta para o Dashboard
  };

  // ...
}
```

---

## Projeto Demo em Sala

> **Atividade prática:** O código completo de todas as telas (`DashboardScreen`, `NovaTransacaoScreen`, `RelatorioScreen`, `DetalheTransacaoScreen`, `BoasVindasScreen`) e dos navegadores (`TabRoutes`, `DashboardStack`) está no [conteúdo complementar](./STEPS.md).

### Como rodar

```bash
cd minhas-financas
npm install
npx expo start
```

### O que o demo mostra

| Aba/Tela | Conceito demonstrado |
|----------|----------------------|
| Barra inferior com ícones | Tab Navigator + `tabBarIcon` |
| Dashboard → Nova Transação | `navigation.navigate()` com params |
| Formulário com campos | `TextInput`, `useState`, validação básica |
| Botão "Salvar" → volta | `navigation.goBack()` + callback |
| Tela de Relatório | Cálculo de totais, exibição de dados |

### Estrutura do projeto demo

```
minhas-financas/
├── App.js
├── routes/
│   └── TabRoutes.js
├── screens/
│   ├── DashboardScreen.js
│   ├── NovaTransacaoScreen.js
│   └── RelatorioScreen.js
├── components/
│   ├── CartaoSaldo.js
│   ├── CardsResumo.js
│   └── ItemTransacao.js
└── theme.js
```

---

---


## Referências

- [React Navigation — documentação oficial](https://reactnavigation.org/docs/getting-started)
- [Bottom Tab Navigator](https://reactnavigation.org/docs/bottom-tab-navigator)
- [Native Stack Navigator](https://reactnavigation.org/docs/native-stack-navigator)
- [Drawer Navigator](https://reactnavigation.org/docs/drawer-navigator)
- [Passagem de parâmetros](https://reactnavigation.org/docs/params)
- [Autenticação com React Navigation](https://reactnavigation.org/docs/auth-flow)
