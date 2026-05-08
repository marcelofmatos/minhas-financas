# Passo a Passo — Tornando o minhas-financas Funcional com AsyncStorage

**Módulo 06 — Aula 04**  
Prof. Marcelo Matos

> Continue com o projeto `minhas-financas` da Aula 3. Esta aula transforma o app de demonstração em um app real com dados que persistem.

---

## O que você vai construir

Ao final deste tutorial, o app **minhas-financas** será totalmente funcional:

- Transações salvas no dispositivo — **não somem ao fechar o app**
- Formulário da Aula 3 **realmente adiciona** transações à lista
- **Toque longo** em uma transação para excluí-la (com confirmação)
- **Spinner de carregamento** enquanto os dados são lidos do armazenamento
- **Tela vazia** com instrução quando não há transações
- Saldo, receitas e despesas **calculados dinamicamente**

---

## Antes de Começar — Checklist

- [ ] Projeto `minhas-financas` das Aulas 2 e 3 funcionando
- [ ] App com Tab Navigator (Dashboard / Nova Transação / Relatório)
- [ ] Expo Go no celular (ou emulador Android)
- [ ] Terminal aberto na pasta `minhas-financas`

---

## Passo 1 — Instalar o AsyncStorage

### 1.1 — No terminal, execute:

```bash
npx expo install @react-native-async-storage/async-storage
```

> Use `npx expo install` (não `npm install`) para garantir que a versão seja compatível com a versão do Expo que você está usando.

### 1.2 — Verifique se apareceu no package.json

Deve aparecer: `"@react-native-async-storage/async-storage": "x.x.x"`

---

## Passo 2 — Criar a pasta de contexto

```bash
mkdir context
```

---

## Passo 3 — Criar o TransacoesContext

Este arquivo é o coração do app nesta aula. Ele gerencia todo o estado de transações e a persistência com AsyncStorage.

### 3.1 — Crie `context/TransacoesContext.js`

```jsx
// context/TransacoesContext.js
import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Chave usada para salvar no AsyncStorage
// Prefixo '@minhasfinancas:' evita conflito com outros apps
const CHAVE_STORAGE = '@minhasfinancas:transacoes';

// 1. Criamos o contexto vazio
const TransacoesContext = createContext(null);

// 2. O Provider é o componente que envolve o app e disponibiliza o estado
export function TransacoesProvider({ children }) {
  const [transacoes, setTransacoes] = useState([]);
  const [carregando, setCarregando] = useState(true);

  // Executa uma única vez quando o app abre
  useEffect(() => {
    carregarTransacoes();
  }, []);

  // Lê as transações salvas no dispositivo
  async function carregarTransacoes() {
    try {
      setCarregando(true);
      const json = await AsyncStorage.getItem(CHAVE_STORAGE);
      if (json !== null) {
        setTransacoes(JSON.parse(json));
      }
    } catch (erro) {
      console.error('Erro ao carregar transações:', erro);
    } finally {
      // "finally" sempre executa, mesmo se der erro
      setCarregando(false);
    }
  }

  // Adiciona uma nova transação e salva no AsyncStorage
  async function adicionarTransacao(novaTransacao) {
    const atualizadas = [novaTransacao, ...transacoes];
    setTransacoes(atualizadas);  // atualiza a UI imediatamente
    await AsyncStorage.setItem(CHAVE_STORAGE, JSON.stringify(atualizadas));
  }

  // Remove uma transação pelo id e salva no AsyncStorage
  async function removerTransacao(id) {
    const atualizadas = transacoes.filter(t => t.id !== id);
    setTransacoes(atualizadas);
    await AsyncStorage.setItem(CHAVE_STORAGE, JSON.stringify(atualizadas));
  }

  // Calcula os totais a partir do estado atual
  const receitas = transacoes
    .filter(t => t.tipo === 'receita')
    .reduce((soma, t) => soma + t.valor, 0);

  const despesas = transacoes
    .filter(t => t.tipo === 'despesa')
    .reduce((soma, t) => soma + t.valor, 0);

  // Tudo que o contexto disponibiliza para as telas
  const valor = {
    transacoes,
    carregando,
    receitas,
    despesas,
    saldo: receitas - despesas,
    adicionarTransacao,
    removerTransacao,
  };

  return (
    <TransacoesContext.Provider value={valor}>
      {children}
    </TransacoesContext.Provider>
  );
}

// 3. Hook customizado — facilita o uso do contexto nas telas
export function useTransacoes() {
  const contexto = useContext(TransacoesContext);
  if (!contexto) {
    throw new Error('useTransacoes precisa estar dentro de <TransacoesProvider>');
  }
  return contexto;
}
```

**O que acontece aqui — resumo:**

| Função | O que faz |
|--------|-----------|
| `carregarTransacoes()` | Lê as transações do AsyncStorage ao abrir o app |
| `adicionarTransacao(t)` | Adiciona ao estado + salva no AsyncStorage |
| `removerTransacao(id)` | Remove do estado + salva no AsyncStorage |
| `receitas`, `despesas`, `saldo` | Calculados automaticamente a partir do estado |

---

## Passo 4 — Conectar o Provider ao App.js

O `TransacoesProvider` precisa envolver todas as telas para que elas possam acessar o contexto.

### 4.1 — Atualize o `App.js`

```jsx
// App.js
import React, { useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { TabRoutes } from './routes/TabRoutes';
import { TransacoesProvider } from './context/TransacoesContext';
import { BoasVindasScreen } from './screens/BoasVindasScreen';

export default function App() {
  // Mantém a navegação condicional da Aula 3 (tela de boas-vindas no primeiro acesso)
  const [primeiroAcesso, setPrimeiroAcesso] = useState(true);

  if (primeiroAcesso) {
    return (
      <SafeAreaProvider>
        <BoasVindasScreen onConcluir={() => setPrimeiroAcesso(false)} />
      </SafeAreaProvider>
    );
  }

  return (
    <SafeAreaProvider>
      <TransacoesProvider>
        <NavigationContainer>
          <TabRoutes />
        </NavigationContainer>
      </TransacoesProvider>
    </SafeAreaProvider>
  );
}
```

> **Lembrete:** o `SafeAreaProvider` (do `react-native-safe-area-context`) já foi instalado na Aula 3 junto com o React Navigation. Mantenha-o no nível mais alto para que o `SafeAreaView` continue funcionando em todas as telas.

> **Ordem importa:** `TransacoesProvider` precisa estar fora de `NavigationContainer` (ou dentro — ambos funcionam). O que não pode é estar fora do que envolve as telas — as telas precisam estar dentro do Provider. Note que ele só envolve o app principal: a `BoasVindasScreen` da Aula 3 não precisa do contexto de transações.

---

## Passo 5 — Atualizar a DashboardScreen

Agora o Dashboard usa o contexto em vez de dados estáticos.

### 5.1 — Substitua o conteúdo de `screens/DashboardScreen.js`

```jsx
// screens/DashboardScreen.js
import React from 'react';
import {
  ScrollView, View, Text, StyleSheet,
  ActivityIndicator, Alert
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { setStatusBarStyle } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { CartaoSaldo } from '../components/CartaoSaldo';
import { CardsResumo } from '../components/CardsResumo';
import { ItemTransacao } from '../components/ItemTransacao';
import { useTransacoes } from '../context/TransacoesContext';
import { cores, espacamento } from '../theme';

export function DashboardScreen({ navigation, route }) {
  const { transacoes, saldo, receitas, despesas, carregando, removerTransacao } = useTransacoes();

  // Mantém o status bar claro enquanto o Dashboard está em foco (cabeçalho azul) — vindo da Aula 3
  useFocusEffect(
    React.useCallback(() => {
      setStatusBarStyle('light');
      return () => setStatusBarStyle('dark');
    }, [])
  );

  function confirmarExclusao(id, descricao) {
    Alert.alert(
      'Excluir transação',
      `Deseja excluir "${descricao}"?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Excluir', style: 'destructive', onPress: () => removerTransacao(id) },
      ]
    );
  }

  // Tela de carregamento
  if (carregando) {
    return (
      <View style={styles.centralizador}>
        <ActivityIndicator size="large" color={cores.primaria} />
        <Text style={styles.textoCarregando}>Carregando suas finanças...</Text>
      </View>
    );
  }

  // Renderiza o Dashboard: cabeçalho, cartão de saldo, resumo e lista de transações (com tela vazia quando não há dados)
  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.cabecalho}>
          <Text style={styles.titulo}>Minhas Finanças</Text>
          <Text style={styles.subtitulo}>
            {new Date().toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}
          </Text>
        </View>

        <CartaoSaldo
          saldo={saldo}
          mes={new Date().toLocaleDateString('pt-BR', { month: 'long' })}
        />

        <CardsResumo receitas={receitas} despesas={despesas} />

        <View style={styles.secao}>
          <Text style={styles.tituloSecao}>Transações Recentes</Text>

          {transacoes.length === 0 ? (
            <View style={styles.vazio}>
              <Ionicons name="wallet-outline" size={64} color="#bdc3c7" />
              <Text style={styles.textoVazio}>Nenhuma transação ainda</Text>
              <Text style={styles.subtextoVazio}>
                Toque em "Nova Transação" para começar
              </Text>
            </View>
          ) : (
            transacoes.map(t => (
              <ItemTransacao
                key={t.id}
                descricao={t.descricao}
                valor={t.valor}
                tipo={t.tipo}
                categoria={t.categoria}
                data={t.data}
                // Navega para o detalhe (DetalheTransacaoScreen criada na Aula 3)
                onPress={() => navigation.navigate('DetalheTransacao', { transacao: t })}
                onLongPress={() => confirmarExclusao(t.id, t.descricao)}
              />
            ))
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: cores.primaria },
  scroll: { flex: 1, backgroundColor: cores.fundo },
  centralizador: {
    flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: cores.fundo,
  },
  textoCarregando: { marginTop: 12, color: cores.subtexto, fontSize: 14 },
  cabecalho: {
    backgroundColor: cores.primaria,
    paddingHorizontal: espacamento.md,
    paddingVertical: espacamento.lg,
  },
  titulo: { color: '#fff', fontSize: 22, fontWeight: 'bold' },
  subtitulo: { color: '#bdc3c7', fontSize: 14, marginTop: 2, textTransform: 'capitalize' },
  secao: { padding: espacamento.md },
  tituloSecao: { fontSize: 17, fontWeight: '700', color: cores.texto, marginBottom: espacamento.md },
  vazio: { alignItems: 'center', paddingVertical: 48, gap: 8 },
  textoVazio: { fontSize: 17, fontWeight: '600', color: cores.subtexto },
  subtextoVazio: { fontSize: 13, color: '#bdc3c7', textAlign: 'center' },
});
```

### 5.2 — Adicionar `onLongPress` ao ItemTransacao

Substitua o conteúdo completo de `components/ItemTransacao.js` pelo código abaixo. Em relação à Aula 2, apenas a prop `onLongPress` foi acrescentada (linhas marcadas com `// ← NOVO`).

```jsx
// components/ItemTransacao.js
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { cores, espacamento, raio } from '../theme';

// Mapeamento de categoria para ícone Ionicons
const ICONES = {
  alimentacao: 'restaurant',
  transporte: 'car',
  saude: 'medical',
  lazer: 'game-controller',
  salario: 'cash',
  moradia: 'home',
  educacao: 'school',
  outros: 'ellipsis-horizontal-circle',
};

export function ItemTransacao({ descricao, valor, categoria, tipo, data, onPress, onLongPress }) { // ← NOVO: prop onLongPress
  const isReceita = tipo === 'receita';
  const nomeIcone = ICONES[categoria] ?? 'ellipsis-horizontal-circle';

  // Renderiza o item da lista: ícone da categoria, descrição/data e valor formatado
  return (
    <TouchableOpacity
      style={styles.container}
      onPress={onPress}
      onLongPress={onLongPress}                                                                    // ← NOVO: dispara a exclusão (toque longo)
      activeOpacity={0.7}
    >
      <View style={[
        styles.iconeContainer,
        { backgroundColor: isReceita ? cores.receitaFundo : cores.despesaFundo }
      ]}>
        <Ionicons
          name={nomeIcone}
          size={22}
          color={isReceita ? cores.receita : cores.despesa}
        />
      </View>

      <View style={styles.info}>
        <Text style={styles.descricao} numberOfLines={1}>{descricao}</Text>
        <Text style={styles.data}>{data}</Text>
      </View>

      <Text style={[styles.valor, { color: isReceita ? cores.receita : cores.despesa }]}>
        {isReceita ? '+' : '-'} R$ {valor.toFixed(2)}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: cores.cartao,
    borderRadius: raio.md,
    padding: espacamento.md,
    marginBottom: espacamento.sm,
    // Sombra (iOS):
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    // Sombra (Android):
    elevation: 2,
  },
  iconeContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,            // círculo perfeito (metade do width/height)
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: espacamento.md,
  },
  info: {
    flex: 1,                     // ocupa todo o espaço entre o ícone e o valor
  },
  descricao: {
    fontSize: 15,
    fontWeight: '600',
    color: cores.texto,
  },
  data: {
    fontSize: 12,
    color: cores.subtexto,
    marginTop: 2,
  },
  valor: {
    fontSize: 15,
    fontWeight: '700',
    marginLeft: espacamento.sm,
  },
});
```

---

## Passo 6 — Atualizar a NovaTransacaoScreen

Troque o `navigation.navigate('Dashboard', { novaTransacao })` pela função do contexto.

### 6.1 — Substitua o conteúdo completo de `screens/NovaTransacaoScreen.js`

```jsx
// screens/NovaTransacaoScreen.js
import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  ScrollView, StyleSheet, Alert
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { cores, espacamento, raio } from '../theme';
import { useTransacoes } from '../context/TransacoesContext';  // ← NOVO

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

  const { adicionarTransacao } = useTransacoes();  // ← NOVO (dentro do componente)

  // ↓ Função salvar atualizada para usar o contexto
  const salvar = async () => {
    if (!descricao.trim()) {
      Alert.alert('Atenção', 'Digite uma descrição.');
      return;
    }
    const valorNumerico = parseFloat(valor.replace(',', '.'));
    if (!valor || isNaN(valorNumerico) || valorNumerico <= 0) {
      Alert.alert('Atenção', 'Digite um valor válido.');
      return;
    }

    await adicionarTransacao({
      id: Date.now().toString(),
      descricao: descricao.trim(),
      valor: valorNumerico,
      tipo,
      categoria,
      data: new Date().toLocaleDateString('pt-BR'),
    });

    setDescricao('');
    setValor('');
    setTipo('despesa');
    setCategoria('outros');

    navigation.navigate('Dashboard');
  };

  return (
    <ScrollView style={styles.container} keyboardShouldPersistTaps="handled">
      <Text style={styles.tituloPagina}>Nova Transação</Text>

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

      <Text style={styles.label}>Descrição</Text>
      <TextInput
        style={styles.input}
        value={descricao}
        onChangeText={setDescricao}
        placeholder="Ex: Supermercado, Salário..."
        maxLength={50}
        returnKeyType="next"
      />

      <Text style={styles.label}>Valor (R$)</Text>
      <TextInput
        style={styles.input}
        value={valor}
        onChangeText={setValor}
        placeholder="0,00"
        keyboardType="decimal-pad"
        returnKeyType="done"
      />

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

## Passo 7 — Atualizar a RelatorioScreen

### 7.1 — Substitua o conteúdo completo de `screens/RelatorioScreen.js`

> ⚠️ **Atenção:** copie e cole o arquivo **inteiro** abaixo, substituindo todo o conteúdo do arquivo.

```jsx
// screens/RelatorioScreen.js
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { cores, espacamento, raio } from '../theme';
import { useTransacoes } from '../context/TransacoesContext';  // ← NOVO

export function RelatorioScreen() {
  const { receitas, despesas, saldo, transacoes } = useTransacoes();  // ← NOVO

  const total = receitas + despesas || 1;

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

## Passo 8 — Testar o app completo

Salve todos os arquivos e aguarde o Expo recarregar.

### 8.1 — Roteiro de teste

1. **Abra o app** → deve aparecer a tela vazia com ícone de carteira
2. **Toque em "Nova Transação"** → preencha: "Salário", R$ 3200, Receita, Salário
3. **Toque em "Salvar"** → volta para o Dashboard com a transação na lista
4. **Adicione uma despesa** → "Supermercado", R$ 150, Despesa, Alimentação
5. **Verifique o saldo** → deve ser R$ 3.050,00 (3200 − 150)
6. **Feche e reabra o app** → as transações devem continuar lá ✅
7. **Toque longo em uma transação** → diálogo de confirmação aparece
8. **Confirme a exclusão** → transação some e saldo atualiza

---

## Passo 9 — Consumindo uma API externa: Cotações do Dia

Agora vamos buscar dados reais da internet usando `fetch`. Vamos exibir as cotações do Dólar e do Euro no Dashboard usando a **AwesomeAPI** — gratuita, sem cadastro e em português.

> **Por que essa API?** `https://economia.awesomeapi.com.br` é mantida pela comunidade brasileira, retorna dados em BRL e não exige chave de acesso.

---

### 9.1 — Criar a pasta `hooks`

```bash
mkdir hooks
```

> **O que é um custom hook?** É uma função que começa com `use` e encapsula lógica reutilizável com hooks do React (`useState`, `useEffect`). Aqui usamos para separar a lógica de busca da API do componente visual.

---

### 9.2 — Crie `hooks/useCotacoes.js`

```jsx
// hooks/useCotacoes.js
import { useState, useEffect } from 'react';

// Documentação em https://docs.awesomeapi.com.br/api-de-moedas
// Tem limitacao de consultas
// const API_URL = 'https://economia.awesomeapi.com.br/json/last/USD-BRL,EUR-BRL';

// API de exemplo
// Sem a limitacao de consulta
const API_URL = 'https://api.cotacoes.cloud.marcelomatos.dev/cotacoes.json';

export function useCotacoes() {
  const [cotacoes, setCotacoes] = useState(null);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState(null);

  useEffect(() => {
    buscarCotacoes();
  }, []);

  async function buscarCotacoes() {
    try {
      setCarregando(true);
      setErro(null);
      const resposta = await fetch(API_URL);
      if (!resposta.ok) throw new Error('Falha na requisição');
      const dados = await resposta.json();
      setCotacoes({
        dolar: parseFloat(dados.USDBRL.bid),
        euro: parseFloat(dados.EURBRL.bid),
      });
    } catch (e) {
      setErro('Não foi possível carregar as cotações.');
    } finally {
      setCarregando(false);
    }
  }

  return { cotacoes, carregando, erro, atualizar: buscarCotacoes };
}
```

**O que acontece aqui:**

| Elemento | Explicação |
|----------|-----------|
| `fetch(API_URL)` | Faz a requisição HTTP GET para a API |
| `resposta.ok` | Verifica se o status HTTP foi 200–299 |
| `resposta.json()` | Converte o corpo da resposta para objeto JS |
| `dados.USDBRL.bid` | O campo `bid` é o preço de compra do dólar |
| `catch` | Captura erros de rede ou de parse |
| `finally` | Sempre desliga o loading, mesmo se der erro |
| `atualizar` | Expõe a função para o componente chamar no botão de refresh |

---

### 9.3 — Crie `components/CartaoCotacoes.js`

```jsx
// components/CartaoCotacoes.js
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useCotacoes } from '../hooks/useCotacoes';
import { cores, espacamento, raio } from '../theme';

export function CartaoCotacoes() {
  const { cotacoes, carregando, erro, atualizar } = useCotacoes();

  return (
    <View style={styles.container}>
      <View style={styles.cabecalho}>
        <Text style={styles.titulo}>Cotações do Dia</Text>
        <TouchableOpacity onPress={atualizar}>
          <Ionicons name="refresh" size={18} color={cores.subtexto} />
        </TouchableOpacity>
      </View>

      {carregando ? (
        <ActivityIndicator size="small" color={cores.primaria} />
      ) : erro ? (
        <Text style={styles.erro}>{erro}</Text>
      ) : (
        <View style={styles.linha}>
          <View style={styles.item}>
            <Text style={styles.moeda}>🇺🇸 Dólar</Text>
            <Text style={styles.valor}>R$ {cotacoes.dolar.toFixed(2)}</Text>
          </View>
          <View style={styles.separador} />
          <View style={styles.item}>
            <Text style={styles.moeda}>🇪🇺 Euro</Text>
            <Text style={styles.valor}>R$ {cotacoes.euro.toFixed(2)}</Text>
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: cores.cartao,
    borderRadius: raio.md,
    padding: espacamento.md,
    marginHorizontal: espacamento.md,
    marginBottom: espacamento.md,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
  },
  cabecalho: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: espacamento.sm,
  },
  titulo: { fontSize: 14, fontWeight: '600', color: cores.subtexto },
  linha: { flexDirection: 'row', alignItems: 'center' },
  item: { flex: 1, alignItems: 'center' },
  moeda: { fontSize: 13, color: cores.subtexto, marginBottom: 2 },
  valor: { fontSize: 18, fontWeight: '700', color: cores.texto },
  separador: { width: 1, height: 36, backgroundColor: '#eee' },
  erro: { fontSize: 13, color: cores.despesa, textAlign: 'center' },
});
```

---

### 9.4 — Adicionar o CartaoCotacoes ao DashboardScreen

Substitua o conteúdo completo de `screens/DashboardScreen.js` pelo código abaixo. Em relação ao Passo 5.1, foram acrescentados o import (linha marcada com `// ← NOVO`) e a renderização do `<CartaoCotacoes />` logo após `<CardsResumo />`.

```jsx
// screens/DashboardScreen.js
import React from 'react';
import {
  ScrollView, View, Text, StyleSheet,
  ActivityIndicator, Alert
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { setStatusBarStyle } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { CartaoSaldo } from '../components/CartaoSaldo';
import { CardsResumo } from '../components/CardsResumo';
import { CartaoCotacoes } from '../components/CartaoCotacoes';   // ← NOVO
import { ItemTransacao } from '../components/ItemTransacao';
import { useTransacoes } from '../context/TransacoesContext';
import { cores, espacamento } from '../theme';

export function DashboardScreen({ navigation, route }) {
  const { transacoes, saldo, receitas, despesas, carregando, removerTransacao } = useTransacoes();

  // Mantém o status bar claro enquanto o Dashboard está em foco (cabeçalho azul) — vindo da Aula 3
  useFocusEffect(
    React.useCallback(() => {
      setStatusBarStyle('light');
      return () => setStatusBarStyle('dark');
    }, [])
  );

  function confirmarExclusao(id, descricao) {
    Alert.alert(
      'Excluir transação',
      `Deseja excluir "${descricao}"?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Excluir', style: 'destructive', onPress: () => removerTransacao(id) },
      ]
    );
  }

  // Tela de carregamento
  if (carregando) {
    return (
      <View style={styles.centralizador}>
        <ActivityIndicator size="large" color={cores.primaria} />
        <Text style={styles.textoCarregando}>Carregando suas finanças...</Text>
      </View>
    );
  }

  // Renderiza o Dashboard: cabeçalho, cartão de saldo, resumo, cotações do dia e lista de transações
  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.cabecalho}>
          <Text style={styles.titulo}>Minhas Finanças</Text>
          <Text style={styles.subtitulo}>
            {new Date().toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}
          </Text>
        </View>

        <CartaoSaldo
          saldo={saldo}
          mes={new Date().toLocaleDateString('pt-BR', { month: 'long' })}
        />

        <CardsResumo receitas={receitas} despesas={despesas} />

        <CartaoCotacoes />

        <View style={styles.secao}>
          <Text style={styles.tituloSecao}>Transações Recentes</Text>

          {transacoes.length === 0 ? (
            <View style={styles.vazio}>
              <Ionicons name="wallet-outline" size={64} color="#bdc3c7" />
              <Text style={styles.textoVazio}>Nenhuma transação ainda</Text>
              <Text style={styles.subtextoVazio}>
                Toque em "Nova Transação" para começar
              </Text>
            </View>
          ) : (
            transacoes.map(t => (
              <ItemTransacao
                key={t.id}
                descricao={t.descricao}
                valor={t.valor}
                tipo={t.tipo}
                categoria={t.categoria}
                data={t.data}
                // Navega para o detalhe (DetalheTransacaoScreen criada na Aula 3)
                onPress={() => navigation.navigate('DetalheTransacao', { transacao: t })}
                onLongPress={() => confirmarExclusao(t.id, t.descricao)}
              />
            ))
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: cores.primaria },
  scroll: { flex: 1, backgroundColor: cores.fundo },
  centralizador: {
    flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: cores.fundo,
  },
  textoCarregando: { marginTop: 12, color: cores.subtexto, fontSize: 14 },
  cabecalho: {
    backgroundColor: cores.primaria,
    paddingHorizontal: espacamento.md,
    paddingVertical: espacamento.lg,
  },
  titulo: { color: '#fff', fontSize: 22, fontWeight: 'bold' },
  subtitulo: { color: '#bdc3c7', fontSize: 14, marginTop: 2, textTransform: 'capitalize' },
  secao: { padding: espacamento.md },
  tituloSecao: { fontSize: 17, fontWeight: '700', color: cores.texto, marginBottom: espacamento.md },
  vazio: { alignItems: 'center', paddingVertical: 48, gap: 8 },
  textoVazio: { fontSize: 17, fontWeight: '600', color: cores.subtexto },
  subtextoVazio: { fontSize: 13, color: '#bdc3c7', textAlign: 'center' },
});
```

---

### 9.5 — Testar

1. Salve todos os arquivos e aguarde o Expo recarregar
2. O Dashboard deve exibir um card "Cotações do Dia" com os valores atuais de Dólar e Euro
3. Toque no ícone de refresh (↻) para buscar os valores mais recentes
4. Desative o Wi-Fi e recarregue — o card deve exibir a mensagem de erro

---

## Resultado Final

| Funcionalidade | Status |
|----------------|--------|
| Transações persistem ao fechar o app | ✅ AsyncStorage |
| Formulário salva de verdade | ✅ `adicionarTransacao()` |
| Excluir com toque longo | ✅ `onLongPress` + `removerTransacao()` |
| Saldo calculado dinamicamente | ✅ `reduce()` no contexto |
| Loading enquanto carrega | ✅ `ActivityIndicator` |
| Tela vazia motivacional | ✅ Empty state |
| Estado compartilhado entre telas | ✅ Context API |
| Cotações do dia via API externa | ✅ `fetch` + AwesomeAPI |

---

## Resolução de Problemas

### "Cannot find module @react-native-async-storage/async-storage"
```bash
npx expo install @react-native-async-storage/async-storage
```
Reinicie o servidor: pressione `r` no terminal do Expo.

### "useTransacoes precisa estar dentro de TransacoesProvider"
Verifique se o `<TransacoesProvider>` envolve o `<NavigationContainer>` no `App.js`.

### Os dados somem ao fechar o app
Confirme que `await AsyncStorage.setItem(...)` está sendo chamado tanto em `adicionarTransacao` quanto em `removerTransacao`.

### O saldo não atualiza após adicionar transação
O saldo é calculado com `reduce()` diretamente do array `transacoes`. Se o array atualizar, o saldo atualiza automaticamente. Certifique-se de que `setTransacoes(atualizadas)` é chamado com o array completo.

### "JSON.parse: unexpected character"
Isso acontece se o AsyncStorage tiver um valor corrompido. Para limpar durante o desenvolvimento:
```jsx
await AsyncStorage.removeItem('@minhasfinancas:transacoes');
```

### O card de cotações mostra "Não foi possível carregar"
Verifique sua conexão com a internet. A AwesomeAPI é um serviço externo e requer rede ativa. No emulador Android, confirme que o acesso à internet está habilitado nas configurações do emulador. Toque no ícone ↻ para tentar novamente.

### As cotações não atualizam automaticamente
O hook `useCotacoes` busca os dados uma única vez ao montar o componente (`useEffect` com array vazio `[]`). Para atualização automática a cada X minutos, adicione um `setInterval` dentro do `useEffect`:
```jsx
useEffect(() => {
  buscarCotacoes();
  const intervalo = setInterval(buscarCotacoes, 5 * 60 * 1000); // a cada 5 min
  return () => clearInterval(intervalo); // limpa ao desmontar
}, []);
```
