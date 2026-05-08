# Passo a Passo — Adicionando Navegação ao minhas-financas

**Módulo 06 — Aula 03**  
Prof. Marcelo Matos

> Continue usando o projeto `minhas-financas` criado na Aula 2. Vamos adicionar navegação acrescentando ao que já fizemos.

---

## O que você vai construir

Ao final deste tutorial, o app terá:

- **Barra de abas inferior** com 4 abas: Dashboard, Nova Transação, Relatório, Sobre
- **Dashboard** — tela da Aula 2 com o saldo e lista de transações
- **Nova Transação** — formulário para digitar descrição, valor, tipo e categoria
- **Relatório** — resumo de receitas x despesas do mês
- **Sobre** — informações do app
- Ao salvar uma nova transação, ela aparece imediatamente na lista do Dashboard

---

## Antes de Começar — Checklist

- [ ] Projeto `minhas-financas` da Aula 2 funcionando
- [ ] `npm install` já executado na Aula 2
- [ ] Expo Go no celular (ou emulador Android)
- [ ] VS Code aberto na pasta do projeto

---

## Passo 1 — Instalar o React Navigation

### 1.1 — Abra o terminal na pasta do projeto

```bash
cd minhas-financas
```

### 1.2 — Instale as dependências

Execute cada comando abaixo:

```bash
npm install @react-navigation/native
npx expo install react-native-screens react-native-safe-area-context
npm install @react-navigation/bottom-tabs
npm install @react-navigation/native-stack
```

> **Por que tantos pacotes?** O React Navigation é modular — você instala apenas o que precisa. `native-screens` melhora a performance usando telas nativas do sistema operacional.

> **Sobre o `react-native-safe-area-context`:** além de ser dependência do React Navigation, esse pacote fornece um `SafeAreaView` mais confiável do que o do `react-native` (que só funciona no iOS e está em vias de deprecação). A partir de agora, **todo `SafeAreaView` do projeto será importado de `react-native-safe-area-context`**, garantindo que o conteúdo respeite o notch e a barra de status em iOS e Android.

### 1.3 — Verifique a instalação

Após instalar, o `package.json` deve ter estas dependências:

```json
{
  "dependencies": {
    "@react-navigation/bottom-tabs": "^7.x.x",
    "@react-navigation/native": "^7.x.x",
    "@react-navigation/native-stack": "^7.x.x",
    "react-native-screens": "~4.x.x",
    "react-native-safe-area-context": "~5.x.x"
  }
}
```

---

## Passo 2 — Criar a estrutura de pastas

### 2.1 — Crie as pastas `screens` e `routes`

```bash
mkdir screens routes
```

### 2.2 — Estrutura que teremos ao final

```
minhas-financas/
├── App.js
├── routes/
│   ├── TabRoutes.js                      ← barra de abas (Passo 6)
│   └── DashboardStack.js                 ← stack com detalhe (Passo 8)
├── screens/
│   ├── DashboardScreen.js                ← tela principal (Passo 3)
│   ├── NovaTransacaoScreen.js            ← formulário (Passo 4)
│   ├── RelatorioScreen.js                ← resumo mensal (Passo 5)
│   ├── SobreScreen.js                    ← sobre o app (Passo 5)
│   ├── DetalheTransacaoScreen.js         ← detalhe de transação (Passo 8)
│   └── BoasVindasScreen.js               ← tela de boas-vindas (Passo 9)
├── components/                           ← da Aula 2
├── theme.js                              ← da Aula 2
└── package.json
```

> Nesta aula, começamos apenas com `screens/` e `routes/` vazios. Os arquivos acima serão criados ao longo dos passos indicados entre parênteses.

---

## Passo 3 — Criar a DashboardScreen

A `DashboardScreen` parte do conteúdo da tela principal da Aula 2 (cabeçalho, `CartaoSaldo`, `CardsResumo` e a lista de transações), mas ganha três responsabilidades novas:

- **recebe `navigation` e `route`** como props — toda tela registrada no React Navigation as recebe automaticamente;
- **escuta `route.params.novaTransacao`** com um `useEffect` para inserir transações criadas no formulário no topo da lista;
- **ajusta o status bar** com `useFocusEffect` para que os ícones do sistema fiquem legíveis sobre o cabeçalho azul.

### 3.1 — Crie `screens/DashboardScreen.js`

```jsx
// screens/DashboardScreen.js
import React from 'react';
import { ScrollView, View, Text, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { setStatusBarStyle } from 'expo-status-bar';
import { CartaoSaldo } from '../components/CartaoSaldo';
import { CardsResumo } from '../components/CardsResumo';
import { ItemTransacao } from '../components/ItemTransacao';
import { cores, espacamento } from '../theme';

const TRANSACOES_INICIAIS = [
  { id: '1', descricao: 'Salário', valor: 3200, tipo: 'receita', categoria: 'salario', data: '01/05/2026' },
  { id: '2', descricao: 'Aluguel', valor: 900, tipo: 'despesa', categoria: 'moradia', data: '05/05/2026' },
  { id: '3', descricao: 'Supermercado', valor: 280.50, tipo: 'despesa', categoria: 'alimentacao', data: '07/05/2026' },
  { id: '4', descricao: 'Energia', valor: 400, tipo: 'despesa', categoria: 'moradia', data: '09/05/2026' },
  { id: '5', descricao: 'Água', valor: 70.50, tipo: 'despesa', categoria: 'moradia', data: '10/05/2026' },
];

export function DashboardScreen({ navigation, route }) {
  const [transacoes, setTransacoes] = React.useState(TRANSACOES_INICIAIS);

  // Recebe novas transações vindas da tela de formulário
  React.useEffect(() => {
    if (route.params?.novaTransacao) {
      setTransacoes(prev => [route.params.novaTransacao, ...prev]);
    }
  }, [route.params?.novaTransacao]);

  // Status bar claro enquanto o Dashboard está em foco (cabeçalho azul)
  useFocusEffect(
    React.useCallback(() => {
      setStatusBarStyle('light');
      return () => setStatusBarStyle('dark');
    }, [])
  );

  const receitas = transacoes
    .filter(t => t.tipo === 'receita')
    .reduce((acc, t) => acc + t.valor, 0);

  const despesas = transacoes
    .filter(t => t.tipo === 'despesa')
    .reduce((acc, t) => acc + t.valor, 0);

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.cabecalho}>
          <Text style={styles.titulo}>Minhas Finanças</Text>
          <Text style={styles.subtitulo}>Maio 2026</Text>
        </View>

        <CartaoSaldo saldo={receitas - despesas} mes="Maio" />
        <CardsResumo receitas={receitas} despesas={despesas} />

        <View style={styles.secao}>
          <Text style={styles.tituloSecao}>Transações Recentes</Text>
          {transacoes.map(t => (
            <ItemTransacao
              key={t.id}
              descricao={t.descricao}
              valor={t.valor}
              tipo={t.tipo}
              categoria={t.categoria}
              data={t.data}
              // Navega para o detalhe passando a transação inteira via route.params
              // (a tela DetalheTransacao será criada no Passo 8)
              onPress={() => navigation.navigate('DetalheTransacao', { transacao: t })}
            />
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: cores.primaria },
  scroll: { flex: 1, backgroundColor: cores.fundo },
  cabecalho: {
    backgroundColor: cores.primaria,
    paddingHorizontal: espacamento.md,
    paddingVertical: espacamento.lg,
  },
  titulo: { color: '#fff', fontSize: 22, fontWeight: 'bold' },
  subtitulo: { color: '#bdc3c7', fontSize: 14, marginTop: 2 },
  secao: { padding: espacamento.md },
  tituloSecao: { fontSize: 17, fontWeight: '700', color: cores.texto, marginBottom: espacamento.md },
});
```

> **Por que `edges={['top']}` no `SafeAreaView`?** O fundo do `SafeAreaView` é azul escuro (`cores.primaria`), pois o cabeçalho precisa cobrir o status bar. Sem essa prop, no Android a `SafeAreaView` também aplica padding na parte de baixo — pintando uma faixa azul logo acima do tab bar. Limitando ao topo, o respiro inferior fica por conta do próprio Tab Navigator.

> **Por que o `useFocusEffect` mexendo no status bar?** No Android, os ícones do status bar (relógio, sinal, bateria) são pretos por padrão e ficam ilegíveis sobre o cabeçalho azul. O `useFocusEffect` do React Navigation roda quando a tela entra em foco e roda o cleanup quando sai — perfeito para deixar os ícones claros só no Dashboard e voltar ao escuro nas outras abas. O `setStatusBarStyle` vem do `expo-status-bar` (já incluído no template Expo).

---

## Passo 4 — Criar a NovaTransacaoScreen

### 4.1 — Crie `screens/NovaTransacaoScreen.js`

```jsx
// screens/NovaTransacaoScreen.js
import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  ScrollView, StyleSheet, Alert
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { cores, espacamento, raio } from '../theme';

const CATEGORIAS = [
  { id: 'alimentacao', label: 'Alimentação', icone: 'restaurant' },
  { id: 'transporte', label: 'Transporte', icone: 'car' },
  { id: 'saude', label: 'Saúde', icone: 'medical' },
  { id: 'lazer', label: 'Lazer', icone: 'game-controller' },
  { id: 'moradia', label: 'Moradia', icone: 'home' },
  { id: 'salario', label: 'Salário', icone: 'cash' },
  { id: 'outros', label: 'Outros', icone: 'ellipsis-horizontal-circle' },
];

export function NovaTransacaoScreen({ navigation }) {
  const [descricao, setDescricao] = useState('');
  const [valor, setValor] = useState('');
  const [tipo, setTipo] = useState('despesa');
  const [categoria, setCategoria] = useState('outros');

  const salvar = () => {
    // Validação básica
    if (!descricao.trim()) {
      Alert.alert('Atenção', 'Digite uma descrição para a transação.');
      return;
    }
    const valorNumerico = parseFloat(valor.replace(',', '.'));
    if (!valor || isNaN(valorNumerico) || valorNumerico <= 0) {
      Alert.alert('Atenção', 'Digite um valor válido maior que zero.');
      return;
    }

    const novaTransacao = {
      id: Date.now().toString(),
      descricao: descricao.trim(),
      valor: valorNumerico,
      tipo,
      categoria,
      data: new Date().toLocaleDateString('pt-BR'),
    };

    // Passa a nova transação para o screen DashboardHome (dentro do DashboardStack)
    navigation.navigate('Dashboard', {
      screen: 'DashboardHome',
      params: { novaTransacao },
    });

    // Limpa o formulário
    setDescricao('');
    setValor('');
    setTipo('despesa');
    setCategoria('outros');
  };

  return (
    <ScrollView style={styles.container} keyboardShouldPersistTaps="handled">
      <Text style={styles.tituloPagina}>Nova Transação</Text>

      {/* Tipo: Receita ou Despesa */}
      <Text style={styles.label}>Tipo</Text>
      <View style={styles.seletor}>
        {['receita', 'despesa'].map(t => (
          <TouchableOpacity
            key={t}
            style={[
              styles.botaoTipo,
              tipo === t && { backgroundColor: t === 'receita' ? cores.receita : cores.despesa }
            ]}
            onPress={() => setTipo(t)}
          >
            <Ionicons
              name={t === 'receita' ? 'arrow-up' : 'arrow-down'}
              size={18}
              color={tipo === t ? '#fff' : '#555'}
            />
            <Text style={[styles.textoTipo, tipo === t && { color: '#fff' }]}>
              {t === 'receita' ? 'Receita' : 'Despesa'}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Descrição */}
      <Text style={styles.label}>Descrição</Text>
      <TextInput
        style={styles.input}
        value={descricao}
        onChangeText={setDescricao}
        placeholder="Ex: Supermercado, Salário..."
        maxLength={50}
        returnKeyType="next"
      />

      {/* Valor */}
      <Text style={styles.label}>Valor (R$)</Text>
      <TextInput
        style={styles.input}
        value={valor}
        onChangeText={setValor}
        placeholder="0,00"
        keyboardType="decimal-pad"
        returnKeyType="done"
      />

      {/* Categoria */}
      <Text style={styles.label}>Categoria</Text>
      <View style={styles.categorias}>
        {CATEGORIAS.map(cat => (
          <TouchableOpacity
            key={cat.id}
            style={[
              styles.chipCategoria,
              categoria === cat.id && styles.chipAtivo
            ]}
            onPress={() => setCategoria(cat.id)}
          >
            <Ionicons
              name={cat.icone}
              size={16}
              color={categoria === cat.id ? '#fff' : cores.subtexto}
            />
            <Text style={[
              styles.textoChip,
              categoria === cat.id && { color: '#fff' }
            ]}>
              {cat.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Botão Salvar */}
      <TouchableOpacity style={styles.botaoSalvar} onPress={salvar} activeOpacity={0.8}>
        <Ionicons name="checkmark" size={22} color="#fff" />
        <Text style={styles.textoBotao}>Salvar Transação</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: cores.fundo, padding: espacamento.md },
  tituloPagina: {
    fontSize: 22, fontWeight: 'bold', color: cores.texto,
    marginTop: espacamento.lg, marginBottom: espacamento.lg,
  },
  label: { fontSize: 14, fontWeight: '600', color: '#555', marginBottom: espacamento.xs },
  input: {
    borderWidth: 1, borderColor: '#ddd', borderRadius: raio.sm,
    padding: 12, fontSize: 16, marginBottom: espacamento.md,
    backgroundColor: '#fff',
  },
  seletor: { flexDirection: 'row', gap: 12, marginBottom: espacamento.md },
  botaoTipo: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 6, padding: 12, borderRadius: raio.sm,
    borderWidth: 1, borderColor: '#ddd', backgroundColor: '#fff',
  },
  textoTipo: { fontSize: 15, fontWeight: '600', color: '#555' },
  categorias: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: espacamento.lg },
  chipCategoria: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    paddingVertical: 6, paddingHorizontal: 12,
    borderRadius: raio.pill, borderWidth: 1, borderColor: '#ddd',
    backgroundColor: '#fff',
  },
  chipAtivo: { backgroundColor: cores.primaria, borderColor: cores.primaria },
  textoChip: { fontSize: 13, color: cores.subtexto },
  botaoSalvar: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 8, backgroundColor: cores.primaria, padding: 16,
    borderRadius: raio.md, marginBottom: espacamento.xl,
  },
  textoBotao: { color: '#fff', fontSize: 16, fontWeight: '700' },
});
```

---

## Passo 5 — Criar a RelatorioScreen e a SobreScreen

### 5.1 — Crie `screens/RelatorioScreen.js`

```jsx
// screens/RelatorioScreen.js
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { cores, espacamento, raio } from '../theme';

export function RelatorioScreen() {
  // Na Aula 4, estes dados virão do Context (AsyncStorage)
  const receitas = 3700;
  const despesas = 2206.30;
  const saldo = receitas - despesas;
  const total = receitas + despesas;

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <Text style={styles.titulo}>Relatório — Maio 2026</Text>

        <View style={styles.barra}>
          <View style={[styles.segmento, {
            flex: receitas / total,
            backgroundColor: cores.receita,
          }]} />
          <View style={[styles.segmento, {
            flex: despesas / total,
            backgroundColor: cores.despesa,
          }]} />
        </View>

        <View style={styles.legenda}>
          <View style={styles.itemLegenda}>
            <View style={[styles.ponto, { backgroundColor: cores.receita }]} />
            <Text style={styles.textoLegenda}>Receitas</Text>
            <Text style={styles.valorLegenda}>R$ {receitas.toFixed(2)}</Text>
          </View>
          <View style={styles.itemLegenda}>
            <View style={[styles.ponto, { backgroundColor: cores.despesa }]} />
            <Text style={styles.textoLegenda}>Despesas</Text>
            <Text style={styles.valorLegenda}>R$ {despesas.toFixed(2)}</Text>
          </View>
        </View>

        <View style={styles.saldoContainer}>
          <Text style={styles.saldoLabel}>Saldo do mês</Text>
          <Text style={[styles.saldoValor, { color: saldo >= 0 ? cores.receita : cores.despesa }]}>
            R$ {saldo.toFixed(2)}
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: cores.fundo },
  container: { flex: 1, padding: espacamento.md },
  titulo: { fontSize: 20, fontWeight: 'bold', color: cores.texto, marginBottom: espacamento.lg },
  barra: {
    flexDirection: 'row', height: 24, borderRadius: raio.pill,
    overflow: 'hidden', marginBottom: espacamento.md,
  },
  segmento: { height: '100%' },
  legenda: { gap: 12, marginBottom: espacamento.lg },
  itemLegenda: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  ponto: { width: 12, height: 12, borderRadius: 6 },
  textoLegenda: { flex: 1, fontSize: 15, color: cores.texto },
  valorLegenda: { fontSize: 15, fontWeight: '700', color: cores.texto },
  saldoContainer: {
    backgroundColor: cores.cartao, borderRadius: raio.md,
    padding: espacamento.md, alignItems: 'center',
  },
  saldoLabel: { fontSize: 14, color: cores.subtexto },
  saldoValor: { fontSize: 28, fontWeight: 'bold', marginTop: 4 },
});
```

---

### 5.2 — Crie `screens/SobreScreen.js`

```jsx
// screens/SobreScreen.js
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { cores, espacamento } from '../theme';

export function SobreScreen() {
  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <Text style={styles.titulo}>Minhas Finanças</Text>
        <Text style={styles.versao}>Versão 1.0.0</Text>
        <Text style={styles.descricao}>
          App de controle financeiro pessoal desenvolvido durante o Módulo 06
          do Curso de Capacitação em Desenvolvimento Full Stack — ITEAM.
        </Text>
        <Text style={styles.tech}>React Native · Expo · AsyncStorage</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: cores.fundo },
  container: { flex: 1, padding: espacamento.md, justifyContent: 'center', alignItems: 'center' },
  titulo: { fontSize: 26, fontWeight: 'bold', color: cores.texto, marginBottom: 4 },
  versao: { fontSize: 14, color: cores.subtexto, marginBottom: espacamento.lg },
  descricao: { fontSize: 15, color: cores.texto, textAlign: 'center', lineHeight: 22, marginBottom: espacamento.md },
  tech: { fontSize: 13, color: cores.subtexto },
});
```

---

## Passo 6 — Criar as rotas de navegação

### 6.1 — Crie `routes/TabRoutes.js`

```jsx
// routes/TabRoutes.js
import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
// A aba Dashboard aponta para um Stack (criado no Passo 8), não diretamente para a tela
import { DashboardStack } from './DashboardStack';
import { NovaTransacaoScreen } from '../screens/NovaTransacaoScreen';
import { RelatorioScreen } from '../screens/RelatorioScreen';
import { SobreScreen } from '../screens/SobreScreen';

const Tab = createBottomTabNavigator();

const ICONES_TAB = {
  Dashboard: { ativa: 'home', inativa: 'home-outline' },
  'Nova Transação': { ativa: 'add-circle', inativa: 'add-circle-outline' },
  Relatório: { ativa: 'bar-chart', inativa: 'bar-chart-outline' },
  Sobre: { ativa: 'information-circle', inativa: 'information-circle-outline' },
};

export function TabRoutes() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: '#2c3e50',
        tabBarInactiveTintColor: '#95a5a6',
        tabBarStyle: {
          backgroundColor: '#fff',
          borderTopColor: '#eee',
          height: 60,
          paddingBottom: 8,
          paddingTop: 4,
        },
        tabBarIcon: ({ focused, color, size }) => {
          const { ativa, inativa } = ICONES_TAB[route.name];
          return <Ionicons name={focused ? ativa : inativa} size={size} color={color} />;
        },
      })}
    >
      <Tab.Screen name="Dashboard" component={DashboardStack} />
      <Tab.Screen name="Nova Transação" component={NovaTransacaoScreen} />
      <Tab.Screen name="Relatório" component={RelatorioScreen} />
      <Tab.Screen name="Sobre" component={SobreScreen} />
    </Tab.Navigator>
  );
}
```

> **Observação:** o import de `DashboardStack` aponta para um arquivo que ainda não existe — ele será criado no Passo 8. O app só compila por inteiro quando o Passo 8 estiver concluído.

---

## Passo 7 — Atualizar o App.js

### 7.1 — Substitua o conteúdo do `App.js`

```jsx
// App.js
import React, { useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { TabRoutes } from './routes/TabRoutes';
// BoasVindasScreen será criada no Passo 9
import { BoasVindasScreen } from './screens/BoasVindasScreen';

export default function App() {
  // Controla qual "árvore" de componentes é renderizada (navegação condicional, Passo 9)
  const [primeiroAcesso, setPrimeiroAcesso] = useState(true);

  // Se for o primeiro acesso, mostra a tela de boas-vindas
  // fora do NavigationContainer — ela não precisa de navegação
  if (primeiroAcesso) {
    return (
      <SafeAreaProvider>
        <BoasVindasScreen onConcluir={() => setPrimeiroAcesso(false)} />
      </SafeAreaProvider>
    );
  }

  return (
    <SafeAreaProvider>
      <NavigationContainer>
        <TabRoutes />
      </NavigationContainer>
    </SafeAreaProvider>
  );
}
```

> **Por que o `SafeAreaProvider`?** Ele expõe (via Context) os valores das áreas seguras do dispositivo (notch, barra de status, home indicator). O `SafeAreaView` que importamos de `react-native-safe-area-context` lê esses valores e aplica o `padding` correto em qualquer tela do app — por isso o Provider precisa ficar no nível mais alto possível.

> **Observação:** o import de `BoasVindasScreen` aponta para um arquivo que ainda não existe — ele será criado no Passo 9. O app só compila por inteiro quando os Passos 8 e 9 estiverem concluídos.

---

## Passo 8 — Stack Navigator: Tela de Detalhe da Transação

O **Stack Navigator** empilha telas umas sobre as outras — ao navegar, a nova tela entra pela direita; ao voltar, sai pela direita. É o padrão de navegação mais comum em apps mobile.

Vamos usá-lo para abrir uma tela de detalhe ao tocar em uma transação no Dashboard.

### 8.1 — Crie `screens/DetalheTransacaoScreen.js`

```jsx
// screens/DetalheTransacaoScreen.js
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { cores, espacamento, raio } from '../theme';

export function DetalheTransacaoScreen({ route, navigation }) {
  const { transacao } = route.params;  // recebe os dados via navigate()
  const isReceita = transacao.tipo === 'receita';

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>

        {/* Botão voltar */}
        <TouchableOpacity style={styles.botaoVoltar} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={22} color={cores.texto} />
          <Text style={styles.textoVoltar}>Voltar</Text>
        </TouchableOpacity>

        {/* Ícone do tipo */}
        <View style={[styles.icone, { backgroundColor: isReceita ? cores.receitaFundo : cores.despesaFundo }]}>
          <Ionicons
            name={isReceita ? 'arrow-up-circle' : 'arrow-down-circle'}
            size={48}
            color={isReceita ? cores.receita : cores.despesa}
          />
        </View>

        <Text style={styles.descricao}>{transacao.descricao}</Text>
        <Text style={[styles.valor, { color: isReceita ? cores.receita : cores.despesa }]}>
          {isReceita ? '+' : '-'} R$ {transacao.valor.toFixed(2)}
        </Text>

        <View style={styles.tabela}>
          <View style={styles.linha}>
            <Text style={styles.rotulo}>Tipo</Text>
            <Text style={styles.dado}>{isReceita ? 'Receita' : 'Despesa'}</Text>
          </View>
          <View style={styles.linha}>
            <Text style={styles.rotulo}>Categoria</Text>
            <Text style={styles.dado}>{transacao.categoria}</Text>
          </View>
          <View style={styles.linha}>
            <Text style={styles.rotulo}>Data</Text>
            <Text style={styles.dado}>{transacao.data}</Text>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: cores.fundo },
  container: { flex: 1, padding: espacamento.md, alignItems: 'center' },
  botaoVoltar: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    alignSelf: 'flex-start', marginBottom: espacamento.lg,
  },
  textoVoltar: { fontSize: 16, color: cores.texto },
  icone: {
    width: 88, height: 88, borderRadius: 44,
    justifyContent: 'center', alignItems: 'center',
    marginBottom: espacamento.md,
  },
  descricao: { fontSize: 22, fontWeight: 'bold', color: cores.texto, marginBottom: 4 },
  valor: { fontSize: 32, fontWeight: '800', marginBottom: espacamento.lg },
  tabela: {
    width: '100%', backgroundColor: cores.cartao,
    borderRadius: raio.md, padding: espacamento.md, gap: 12,
  },
  linha: { flexDirection: 'row', justifyContent: 'space-between' },
  rotulo: { fontSize: 14, color: cores.subtexto },
  dado: { fontSize: 14, fontWeight: '600', color: cores.texto },
});
```

---

### 8.2 — Crie `routes/DashboardStack.js`

Este arquivo envolve o Dashboard em um Stack, permitindo empilhar a tela de detalhe sobre ele.

```jsx
// routes/DashboardStack.js
import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { DashboardScreen } from '../screens/DashboardScreen';
import { DetalheTransacaoScreen } from '../screens/DetalheTransacaoScreen';

const Stack = createNativeStackNavigator();

export function DashboardStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="DashboardHome" component={DashboardScreen} />
      <Stack.Screen name="DetalheTransacao" component={DetalheTransacaoScreen} />
    </Stack.Navigator>
  );
}
```

---

### 8.3 — Como o Stack se conecta com o resto do app

Os arquivos do Passo 6 e do Passo 4 já foram preparados para esta integração:

- **`routes/TabRoutes.js`** já importa `DashboardStack` (em vez de `DashboardScreen`) e o usa como `component` da aba Dashboard. Assim, quando o usuário toca em uma transação, o Stack consegue empilhar a `DetalheTransacaoScreen` por cima.
- **`screens/DashboardScreen.js`** já chama `navigation.navigate('DetalheTransacao', { transacao: t })` no `onPress` do `ItemTransacao`, passando a transação inteira como parâmetro. Na `DetalheTransacaoScreen`, esse objeto é lido com `route.params.transacao`.
- **`screens/NovaTransacaoScreen.js`** já usa o formato aninhado `navigation.navigate('Dashboard', { screen: 'DashboardHome', params: { novaTransacao } })`. Como `Dashboard` agora é um **Stack**, os parâmetros precisam ser direcionados ao screen interno `DashboardHome` — caso contrário ficam no nível do Stack e a lista do Dashboard não atualiza ao salvar.

> **Como funciona a passagem de parâmetros:**
> - `navigation.navigate('NomeDaTela', { chave: valor })` — envia os dados
> - `route.params.chave` — recebe os dados na tela de destino
> - O objeto pode ter qualquer estrutura: strings, números, objetos inteiros

> **Por que a estrutura `{ screen, params }`?** É o formato padrão do React Navigation para alcançar um screen aninhado dentro de outro navigator. `screen` é o nome do screen interno e `params` é o objeto que chega em `route.params` daquele screen.

---

## Passo 9 — Navegação Condicional: Tela de Boas-vindas

A **navegação condicional** exibe telas diferentes dependendo do estado do app — o padrão mais comum é mostrar uma tela de boas-vindas no primeiro acesso.

### 9.1 — Crie `screens/BoasVindasScreen.js`

```jsx
// screens/BoasVindasScreen.js
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { cores, espacamento, raio } from '../theme';

export function BoasVindasScreen({ onConcluir }) {
  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <Ionicons name="wallet" size={80} color={cores.receita} />
        <Text style={styles.titulo}>Bem-vindo ao{'\n'}Minhas Finanças!</Text>
        <Text style={styles.subtitulo}>
          Controle suas receitas e despesas de forma simples e rápida.
        </Text>

        <View style={styles.recursos}>
          {[
            { icone: 'add-circle-outline', texto: 'Registre receitas e despesas' },
            { icone: 'stats-chart-outline', texto: 'Veja seu saldo em tempo real' },
            { icone: 'save-outline', texto: 'Dados salvos no seu dispositivo' },
          ].map((item, i) => (
            <View key={i} style={styles.recurso}>
              <Ionicons name={item.icone} size={22} color={cores.primaria} />
              <Text style={styles.textoRecurso}>{item.texto}</Text>
            </View>
          ))}
        </View>

        <TouchableOpacity style={styles.botao} onPress={onConcluir} activeOpacity={0.8}>
          <Text style={styles.textoBotao}>Começar</Text>
          <Ionicons name="arrow-forward" size={20} color="#fff" />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: cores.fundo },
  container: {
    flex: 1, padding: espacamento.md,
    justifyContent: 'center', alignItems: 'center', gap: 16,
  },
  titulo: {
    fontSize: 28, fontWeight: 'bold', color: cores.texto,
    textAlign: 'center', lineHeight: 36,
  },
  subtitulo: { fontSize: 15, color: cores.subtexto, textAlign: 'center', lineHeight: 22 },
  recursos: { gap: 12, marginVertical: 8 },
  recurso: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  textoRecurso: { fontSize: 15, color: cores.texto },
  botao: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    backgroundColor: cores.primaria, paddingVertical: 14,
    paddingHorizontal: 32, borderRadius: raio.pill, marginTop: 8,
  },
  textoBotao: { color: '#fff', fontSize: 16, fontWeight: '700' },
});
```

### 9.2 — Como o App.js usa a tela de boas-vindas

O `App.js` do Passo 7 já contém toda a lógica condicional pronta:

- importa `BoasVindasScreen` de `./screens/BoasVindasScreen`;
- mantém o estado `primeiroAcesso` (iniciado em `true`);
- se `primeiroAcesso === true`, renderiza `<BoasVindasScreen onConcluir={...} />` fora do `NavigationContainer`;
- ao receber `onConcluir`, chama `setPrimeiroAcesso(false)` e troca para o app principal (`NavigationContainer` + `TabRoutes`).

Assim, basta criar o arquivo `screens/BoasVindasScreen.js` (Passo 9.1) — não é necessário mexer no `App.js`.

> **Como funciona:** o estado `primeiroAcesso` controla qual "árvore" de componentes é renderizada. Quando o usuário toca em "Começar", `setPrimeiroAcesso(false)` troca para o app principal. Em produção, esse estado seria persistido no AsyncStorage para não mostrar a tela toda vez que o app abrir.

---

## Resultado Final

| Funcionalidade | Como foi feita |
|----------------|----------------|
| Barra de abas | `createBottomTabNavigator` |
| Ícones nas abas | `tabBarIcon` + `Ionicons` |
| Aba Sobre | `SobreScreen` como 4ª aba |
| Formulário de transação | `TextInput` + `useState` |
| Salvando e voltando | `navigation.navigate()` com parâmetros |
| Recebendo dados | `route.params` |
| Tela de detalhe | `createNativeStackNavigator` dentro de uma aba |
| Passagem de parâmetros | `navigate('Tela', { dado })` → `route.params.dado` |
| Navegação condicional | Estado no `App.js` controla qual navigator renderizar |

---

## Resolução de Problemas

### "Unable to resolve module @react-navigation/..."
Reinstale todos os pacotes de navegação do Passo 1.2:
```bash
npm install @react-navigation/native
npx expo install react-native-screens react-native-safe-area-context
npm install @react-navigation/bottom-tabs
npm install @react-navigation/native-stack
```
Em seguida, derrube o Metro (Ctrl+C no terminal do Expo) e rode `npx expo start -c` para limpar o cache.

### Aparece uma faixa azul acima da barra de abas (só no celular)
Acontece quando o `SafeAreaView` do `DashboardScreen` está com fundo azul (`cores.primaria`) e aplica `padding` também na borda inferior. No Android, esse padding vira uma faixa colorida acima do tab bar. Limite a safe area só ao topo:
```jsx
<SafeAreaView style={styles.safeArea} edges={['top']}>
```
A borda inferior é cuidada automaticamente pelo Tab Navigator.

### Ícones do status bar (relógio, sinal, bateria) ilegíveis no Dashboard
No Android, esses ícones são pretos por padrão e somem sobre o cabeçalho azul. Use `useFocusEffect` no `DashboardScreen` para deixá-los claros enquanto a tela está em foco e voltar ao escuro quando o usuário troca de aba:
```jsx
import { useFocusEffect } from '@react-navigation/native';
import { setStatusBarStyle } from 'expo-status-bar';

useFocusEffect(
  React.useCallback(() => {
    setStatusBarStyle('light');
    return () => setStatusBarStyle('dark');
  }, [])
);
```

### A nova transação não aparece no Dashboard ao voltar
Duas causas possíveis:

**1) O `useEffect` não está observando `route.params?.novaTransacao`** no `DashboardScreen`:

```jsx
useEffect(() => {
  if (route.params?.novaTransacao) {
    setTransacoes(prev => [route.params.novaTransacao, ...prev]);
  }
}, [route.params?.novaTransacao]);
```

**2) O `salvar` da `NovaTransacaoScreen` está usando o formato direto** em vez do aninhado. Como `Dashboard` é um Stack (e não um screen direto), os parâmetros precisam alcançar o screen interno `DashboardHome` (veja Passo 8.3):
```jsx
navigation.navigate('Dashboard', {
  screen: 'DashboardHome',
  params: { novaTransacao },
});
```

### O teclado cobre os campos no formulário
Substitua `<ScrollView>` por `<KeyboardAvoidingView>`:
```jsx
import { KeyboardAvoidingView, Platform } from 'react-native';

<KeyboardAvoidingView
  behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
  style={{ flex: 1 }}
>
```

### O app fecha ao navegar
Certifique-se de que `NavigationContainer` está no nível mais alto do `App.js`, fora de qualquer outro componente.

### Tela em branco ao abrir o app
Verifique se no `DashboardScreen.js` o `import React from 'react'` está no topo do arquivo. Sem esse import, `React.useState` e `React.useEffect` ficam undefined e o app não renderiza nada. Os logs no navegador também pode oferecer pistas sobre o problema.

### `route.params` está `undefined` na tela de detalhe
Confirme que você está passando os parâmetros no `navigate`:
```jsx
navigation.navigate('DetalheTransacao', { transacao: t })
//                   ↑ nome exato da Screen  ↑ objeto com os dados
```
E que o nome da Screen no Stack corresponde exatamente ao que foi usado no `navigate`.

