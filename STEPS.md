# Passo a Passo — Armazenamento com SQLite

**Módulo 06 — Aula 05**  
Prof. Marcelo Matos

> Continue com o projeto `minhas-financas`. Vamos substituir o AsyncStorage por SQLite — um banco de dados relacional que roda direto no dispositivo.

---

## O que você vai construir

Ao final deste tutorial, o app terá:

- Banco de dados SQLite criado automaticamente no primeiro acesso
- Transações salvas em uma tabela SQL (`transacoes`)
- Operações de INSERT, SELECT e DELETE usando SQL
- Migração transparente do AsyncStorage para SQLite
- Tela de boas-vindas só na primeira abertura, com flag persistida em AsyncStorage
- Botão **Excluir** na tela de detalhe da transação, com confirmação via Alert nativo

---

## AsyncStorage × SQLite — Quando usar cada um?

| | AsyncStorage | SQLite |
|---|---|---|
| Estrutura | Chave-valor (como um dicionário) | Tabelas com colunas (como planilha) |
| Consultas | Busca toda a lista, filtra no JS | Filtra diretamente no banco (`WHERE`, `ORDER BY`) |
| Performance | Boa para poucos dados | Melhor para muitos registros |
| Ideal para | Preferências, configurações, listas pequenas | Histórico longo, filtros complexos, dados relacionais |
| Exemplo | `{ "transacoes": "[...]" }` | `SELECT * FROM transacoes WHERE tipo = 'despesa'` |

---

## Onde o SQLite aparece em apps reais

O SQLite é o banco de dados mais usado no mundo — está dentro de **todo iPhone, todo Android, todos os principais navegadores e na maioria dos apps móveis**. Ver exemplos do dia a dia ajuda a entender que o que você está aprendendo aqui é exatamente o mesmo padrão usado por apps de milhões de usuários.

### Padrões comuns de uso em apps móveis

| Padrão | Exemplo prático | Por que SQLite |
|---|---|---|
| **Histórico de mensagens** | WhatsApp, Telegram, Signal armazenam todas as conversas localmente | Volume alto, busca rápida por contato/data |
| **Cache offline de dados do servidor** | Instagram e Twitter mostram o feed mesmo sem rede | Permite filtrar e ordenar sem nova requisição |
| **Conteúdo baixado para offline** | Spotify, YouTube Music, Netflix gerenciam o que está disponível sem internet | Relaciona arquivos, metadados, expiração |
| **Histórico de atividade** | Strava, Nike Run, Apple Saúde guardam treinos, rotas, métricas | Consultas por período, agregações (`SUM`, `AVG`) |
| **Notas e produtividade** | Apple Notes, Google Keep, Notion guardam textos e metadados | Busca por título, tags, data |
| **Histórico do navegador** | Chrome, Safari, Firefox usam SQLite para histórico, favoritos e cookies | Milhões de registros com busca instantânea |
| **Carrinho e lista de desejos** | Shopee, Amazon, Mercado Livre lembram itens entre sessões | Dados estruturados que sobrevivem ao logout |
| **Fila de sincronização** | Apps offline-first guardam ações para enviar quando voltar a internet | Marca registros como "pendente" via coluna de status |
| **Saves de jogos** | A maioria dos jogos mobile guarda progresso, conquistas e configurações | Robusto, transacional, sem servidor |

### Por que tantos apps escolhem SQLite

- **Está embutido no sistema operacional** — Android e iOS já incluem o SQLite, então não há dependência extra para o usuário baixar
- **Funciona offline por padrão** — não precisa de servidor, ideal para apps que precisam continuar usáveis sem rede
- **Lida com volume real** — milhares ou milhões de registros sem perder performance, desde que existam índices apropriados
- **Suporta consultas complexas** — `WHERE`, `JOIN`, `GROUP BY`, `SUM` resolvem no banco o que seria caro em JavaScript
- **Padrão SQL universal** — o que você aprende aqui vale para PostgreSQL, MySQL, SQL Server e qualquer banco relacional

> **Onde o `minhas-financas` se encaixa nisso?** O app combina dois padrões clássicos: **histórico de atividade** (a tabela `transacoes` cresce com o tempo) e **agregações** (somar receitas e despesas). Esse é o cenário típico em que SQLite brilha — exatamente o mesmo desenho usado por apps de fitness, bancos digitais e ferramentas de produtividade.

---

## Antes de Começar — Checklist

- [ ] Projeto `minhas-financas` das Aulas 2, 3 e 4 funcionando
- [ ] AsyncStorage funcionando (aula 4)
- [ ] Terminal aberto na pasta `minhas-financas`

---

## Passo 1 — Instalar o expo-sqlite

```bash
npx expo install expo-sqlite
```

> Use `npx expo install` para garantir compatibilidade com sua versão do Expo.

---

## Passo 2 — Criar o helper do banco de dados

### 2.1 — Crie `database/db.js`

```bash
mkdir database
```

```jsx
// database/db.js
import * as SQLite from 'expo-sqlite';

// Abre (ou cria) o banco de dados
const db = SQLite.openDatabaseSync('minhasfinancas.db');

// Cria a tabela se ainda não existir
export function inicializarBanco() {
  db.execSync(`
    CREATE TABLE IF NOT EXISTS transacoes (
      id        TEXT PRIMARY KEY,
      descricao TEXT NOT NULL,
      valor     REAL NOT NULL,
      tipo      TEXT NOT NULL,
      categoria TEXT NOT NULL,
      data      TEXT NOT NULL
    );
  `);
}

// Retorna todas as transações, mais recentes primeiro
export function buscarTodasTransacoes() {
  return db.getAllSync(
    'SELECT * FROM transacoes ORDER BY rowid DESC'
  );
}

// Insere uma nova transação
export function inserirTransacao(t) {
  db.runSync(
    'INSERT INTO transacoes (id, descricao, valor, tipo, categoria, data) VALUES (?, ?, ?, ?, ?, ?)',
    [t.id, t.descricao, t.valor, t.tipo, t.categoria, t.data]
  );
}

// Remove uma transação pelo id
export function excluirTransacao(id) {
  db.runSync('DELETE FROM transacoes WHERE id = ?', [id]);
}

// ---------------------------------------------------------------------------
// Bônus — STEPS.md Passo 4.2 (debug opcional)
// Descomente temporariamente para inspecionar o conteúdo da tabela no console.
// ---------------------------------------------------------------------------
// export function logTransacoes() {
//   const dados = db.getAllSync('SELECT * FROM transacoes');
//   console.log('Transações no banco:', JSON.stringify(dados, null, 2));
// }

// ---------------------------------------------------------------------------
// Bônus — STEPS.md Passo 5 (consultas avançadas com SQL)
// Demonstram o poder do SQL para filtrar diretamente no banco, sem trazer
// tudo para o JavaScript. Não são usadas na tela ainda — descomente quando
// for consumir em algum componente.
// ---------------------------------------------------------------------------

// Busca apenas despesas de uma categoria
// export function buscarPorCategoria(categoria) {
//   return db.getAllSync(
//     'SELECT * FROM transacoes WHERE categoria = ? ORDER BY rowid DESC',
//     [categoria]
//   );
// }

// Soma total por tipo
// export function totalPorTipo(tipo) {
//   const resultado = db.getFirstSync(
//     'SELECT SUM(valor) as total FROM transacoes WHERE tipo = ?',
//     [tipo]
//   );
//   return resultado?.total ?? 0;
// }

// Busca transações de um período
// export function buscarPorPeriodo(dataInicio, dataFim) {
//   return db.getAllSync(
//     'SELECT * FROM transacoes WHERE data BETWEEN ? AND ? ORDER BY data DESC',
//     [dataInicio, dataFim]
//   );
// }
```

**Explicando o SQL:**

| Comando | O que faz |
|---------|-----------|
| `CREATE TABLE IF NOT EXISTS` | Cria a tabela só se ela ainda não existir |
| `TEXT`, `REAL` | Tipos de coluna: texto e número decimal |
| `PRIMARY KEY` | Garante que o `id` é único |
| `SELECT * FROM ... ORDER BY rowid DESC` | Busca tudo, mais recentes primeiro |
| `INSERT INTO ... VALUES (?, ?, ...)` | Os `?` são substituídos pelos valores do array |
| `DELETE FROM ... WHERE id = ?` | Remove apenas a linha com aquele id |
| `UPDATE ... SET coluna = ? WHERE id = ?` | Modifica colunas de uma linha existente (ver **Referência Rápida — R1**) |

---

## Passo 3 — Atualizar o TransacoesContext

Substitua o uso de AsyncStorage pelo SQLite no contexto.

### 3.1 — Substitua o conteúdo completo de `context/TransacoesContext.js`

> ⚠️ **Atenção:** copie e cole o arquivo inteiro abaixo.

```jsx
// context/TransacoesContext.js
import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  inicializarBanco,
  buscarTodasTransacoes,
  inserirTransacao,
  excluirTransacao,
} from '../database/db';

const TransacoesContext = createContext(null);

export function TransacoesProvider({ children }) {
  const [transacoes, setTransacoes] = useState([]);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    inicializarBanco();   // cria a tabela se não existir
    carregarTransacoes();
  }, []);

  function carregarTransacoes() {
    try {
      setCarregando(true);
      const dados = buscarTodasTransacoes();
      setTransacoes(dados);
    } catch (erro) {
      console.error('Erro ao carregar transações:', erro);
    } finally {
      setCarregando(false);
    }
  }

  function adicionarTransacao(novaTransacao) {
    inserirTransacao(novaTransacao);
    setTransacoes(prev => [novaTransacao, ...prev]);
  }

  function removerTransacao(id) {
    excluirTransacao(id);
    setTransacoes(prev => prev.filter(t => t.id !== id));
  }

  const receitas = transacoes
    .filter(t => t.tipo === 'receita')
    .reduce((soma, t) => soma + t.valor, 0);

  const despesas = transacoes
    .filter(t => t.tipo === 'despesa')
    .reduce((soma, t) => soma + t.valor, 0);

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

export function useTransacoes() {
  const contexto = useContext(TransacoesContext);
  if (!contexto) {
    throw new Error('useTransacoes precisa estar dentro de <TransacoesProvider>');
  }
  return contexto;
}
```

**O que mudou em relação à Aula 4:**

| Antes (AsyncStorage) | Agora (SQLite) |
|---|---|
| `await AsyncStorage.getItem(...)` | `buscarTodasTransacoes()` — síncrono |
| `await AsyncStorage.setItem(...)` | `inserirTransacao(t)` — síncrono |
| Salva JSON da lista inteira | Insere/deleta apenas o registro afetado |
| `async/await` necessário | Sem `async/await` — SQLite sync API |

> **Por que síncrono?** O `expo-sqlite` moderno oferece uma API síncrona (`execSync`, `runSync`, `getAllSync`) que simplifica o código. O banco roda em uma thread separada internamente, então não trava a UI.

---

## Passo 4 — Testar a migração

Salve todos os arquivos e aguarde o Expo recarregar.

### 4.1 — Roteiro de teste

1. **Abra o app** → se tinha dados do AsyncStorage, a lista começa vazia (banco SQLite novo)
2. **Adicione uma transação** → deve aparecer na lista
3. **Feche e reabra o app** → transação deve continuar lá
4. **Faça toque longo** → confirme a exclusão — deve sumir da lista

### 4.2 — Verificar o banco via log (opcional)

O bloco já está em `database/db.js` comentado. Descomente temporariamente para inspecionar os dados:

```jsx
export function logTransacoes() {
  const dados = db.getAllSync('SELECT * FROM transacoes');
  console.log('Transações no banco:', JSON.stringify(dados, null, 2));
}
```

---

## Passo 5 — Consultas avançadas com SQL (bônus)

Uma das vantagens do SQLite é poder filtrar diretamente no banco, sem carregar tudo para o JavaScript.

### 5.1 — Descomente em `database/db.js`

```jsx
// Busca apenas despesas de uma categoria
export function buscarPorCategoria(categoria) {
  return db.getAllSync(
    'SELECT * FROM transacoes WHERE categoria = ? ORDER BY rowid DESC',
    [categoria]
  );
}

// Soma total por tipo
export function totalPorTipo(tipo) {
  const resultado = db.getFirstSync(
    'SELECT SUM(valor) as total FROM transacoes WHERE tipo = ?',
    [tipo]
  );
  return resultado?.total ?? 0;
}

// Busca transações de um período
export function buscarPorPeriodo(dataInicio, dataFim) {
  return db.getAllSync(
    'SELECT * FROM transacoes WHERE data BETWEEN ? AND ? ORDER BY data DESC',
    [dataInicio, dataFim]
  );
}
```

> Essas funções não são usadas na tela agora, mas demonstram o poder do SQL para consultas específicas — algo que o AsyncStorage não oferece.

---

## Passo 6 — Persistir o primeiro acesso com AsyncStorage

Hoje a tela de boas-vindas reaparece toda vez que o app é aberto, porque o estado `primeiroAcesso` vive apenas em memória. Vamos criar um **contexto dedicado** que persiste essa flag no `AsyncStorage` — sem mexer no `TransacoesContext` (que cuida só das transações no SQLite).

### Por que dois contextos e dois armazenamentos?

| Responsabilidade | Contexto | Armazenamento |
|---|---|---|
| Lista de transações | `TransacoesContext` | SQLite |
| Flag de primeiro acesso | `PrimeiroAcessoContext` (novo) | AsyncStorage |

> **Por que AsyncStorage e não SQLite?** A flag é um único booleano que o app lê uma vez ao abrir. Criar uma tabela SQL para isso seria exagero. AsyncStorage (chave-valor) é a ferramenta certa para preferências e flags simples. Esse é um padrão comum: **SQLite para dados relacionais, AsyncStorage para preferências do usuário**.

### 6.1 — Crie `context/PrimeiroAcessoContext.js`

```jsx
// context/PrimeiroAcessoContext.js
import React, { createContext, useContext, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const CHAVE = '@minhasfinancas:primeiro_acesso_concluido';

const PrimeiroAcessoContext = createContext(null);

export function PrimeiroAcessoProvider({ children }) {
  const [primeiroAcesso, setPrimeiroAcesso] = useState(true);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    AsyncStorage.getItem(CHAVE).then(valor => {
      if (valor === 'true') setPrimeiroAcesso(false);
      setCarregando(false);
    });
  }, []);

  async function concluir() {
    await AsyncStorage.setItem(CHAVE, 'true');
    setPrimeiroAcesso(false);
  }

  return (
    <PrimeiroAcessoContext.Provider value={{ primeiroAcesso, carregando, concluir }}>
      {children}
    </PrimeiroAcessoContext.Provider>
  );
}

export function usePrimeiroAcesso() {
  const contexto = useContext(PrimeiroAcessoContext);
  if (!contexto) {
    throw new Error('usePrimeiroAcesso precisa estar dentro de <PrimeiroAcessoProvider>');
  }
  return contexto;
}
```

**Como funciona:**

| Estado / função | Papel |
|---|---|
| `primeiroAcesso` | Booleano — controla qual árvore o `App.js` renderiza |
| `carregando` | Verdadeiro até a leitura inicial do AsyncStorage terminar |
| `useEffect` | Roda uma vez ao montar; lê a chave e desliga o `carregando` |
| `concluir()` | Grava `'true'` na chave e atualiza o estado — chamado pelo botão "Começar" |
| `usePrimeiroAcesso()` | Hook que consome o contexto, com guarda de erro se usado fora do Provider |

### 6.2 — Substitua o conteúdo completo de `App.js`

```jsx
// App.js
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { TabRoutes } from './routes/TabRoutes';
import { TransacoesProvider } from './context/TransacoesContext';
import { BoasVindasScreen } from './screens/BoasVindasScreen';
import {
  PrimeiroAcessoProvider,
  usePrimeiroAcesso,
} from './context/PrimeiroAcessoContext';

function ConteudoApp() {
  const { primeiroAcesso, carregando, concluir } = usePrimeiroAcesso();

  // Enquanto lê o AsyncStorage, evita o flash da tela de boas-vindas
  if (carregando) return null;

  if (primeiroAcesso) {
    return <BoasVindasScreen onConcluir={concluir} />;
  }

  return (
    <TransacoesProvider>
      <NavigationContainer>
        <TabRoutes />
      </NavigationContainer>
    </TransacoesProvider>
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      <PrimeiroAcessoProvider>
        <ConteudoApp />
      </PrimeiroAcessoProvider>
    </SafeAreaProvider>
  );
}
```

**O que mudou em relação à Aula 4:**

| Antes (Aula 4) | Agora (Aula 5) |
|---|---|
| `useState(true)` direto no `App.js` | Estado dentro do `PrimeiroAcessoProvider` |
| Flag perdia o valor ao fechar o app | Persistida no AsyncStorage |
| Welcome reaparecia toda vez | Aparece só uma vez por instalação |
| `App.js` tinha toda a lógica | `App.js` só compõe os Providers; `ConteudoApp` decide a árvore |

> **Por que `if (carregando) return null;`?** A primeira leitura do AsyncStorage é assíncrona. Sem o guard, o app começaria com `primeiroAcesso = true` (default), montaria a tela de boas-vindas, e logo depois descobriria que a flag já estava persistida — gerando um "flash" da tela errada. Retornar `null` durante o carregamento mostra a tela em branco rapidamente até a leitura terminar.

> **Por que o `TransacoesProvider` continua só dentro do app principal?** A `BoasVindasScreen` não consome transações. Mantendo o `TransacoesProvider` dentro do `if (primeiroAcesso) { ... }`, o SQLite só é inicializado quando o usuário entra no app de fato.

### 6.3 — Roteiro de teste

1. **Apague o app** do celular/emulador (ou rode com cache limpo via `npx expo start -c`)
2. Abra → tela de boas-vindas aparece
3. Toque em **Começar** → vai para o Dashboard
4. **Feche e reabra** o app → vai direto ao Dashboard, sem boas-vindas ✅
5. Para repetir o teste, desinstale o app ou limpe os dados do Expo Go

---

## Passo 7 — Botão excluir na tela de detalhe

Hoje só é possível excluir uma transação com **toque longo** na lista do Dashboard. Vamos adicionar um botão **"Excluir"** visível na tela de detalhe, onde o usuário já está olhando o item e tem todo o contexto para decidir.

### Por que na tela de detalhe?

| | Toque longo na lista | Botão na tela de detalhe |
|---|---|---|
| Descoberta | Gesto oculto | Visual e óbvio |
| Contexto | Apenas o resumo da linha | Item aberto, todos os dados à vista |
| Risco | Pode disparar sem querer | Ação intencional após inspeção |

> Os dois caminhos vão **coexistir**: o toque longo continua como atalho rápido para quem já o conhece, e o botão entra como ponto de acesso óbvio para todos os usuários.

### O que vamos reaproveitar

- O `TransacoesContext` já expõe `removerTransacao` (criado no Passo 3) — ele apaga no SQLite e atualiza a lista em memória
- O Dashboard consome a lista do contexto, então re-renderiza sozinho quando a transação some

Ou seja: nenhum arquivo do banco ou do contexto precisa mudar. A alteração é **só na tela de detalhe**.

### 7.1 — Substitua o conteúdo completo de `screens/DetalheTransacaoScreen.js`

> ⚠️ **Atenção:** copie e cole o arquivo inteiro abaixo.

```jsx
// screens/DetalheTransacaoScreen.js
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTransacoes } from '../context/TransacoesContext';
import { cores, espacamento, raio } from '../theme';

export function DetalheTransacaoScreen({ route, navigation }) {
  const { transacao } = route.params;  // recebe os dados via navigate()
  const isReceita = transacao.tipo === 'receita';
  const { removerTransacao } = useTransacoes();

  function confirmarExclusao() {
    const mensagem = `Deseja excluir "${transacao.descricao}"?`;
    const excluir = () => {
      removerTransacao(transacao.id);
      navigation.goBack();
    };

    // No react-native-web, Alert.alert ignora os botões e nunca chama onPress.
    // Usamos window.confirm para que a confirmação funcione no Expo Web.
    if (Platform.OS === 'web') {
      if (window.confirm(mensagem)) excluir();
      return;
    }

    Alert.alert(
      'Excluir transação',
      mensagem,
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Excluir', style: 'destructive', onPress: excluir },
      ]
    );
  }

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

        <TouchableOpacity
          style={styles.botaoExcluir}
          onPress={confirmarExclusao}
          accessibilityRole="button"
          accessibilityLabel="Excluir transação"
        >
          <Ionicons name="trash-outline" size={20} color={cores.despesa} />
          <Text style={styles.textoExcluir}>Excluir</Text>
        </TouchableOpacity>
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
  botaoExcluir: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    width: '100%',
    marginTop: espacamento.lg,
    paddingVertical: espacamento.md,
    borderRadius: raio.md,
    borderWidth: 1,
    borderColor: cores.despesa,
    backgroundColor: 'transparent',
  },
  textoExcluir: { fontSize: 16, fontWeight: '600', color: cores.despesa },
});
```

**O que mudou em relação à versão anterior:**

| Adição | Por quê |
|---|---|
| `Alert` no import de `react-native` | Para exibir o diálogo nativo de confirmação |
| `useTransacoes` do contexto | Para acessar `removerTransacao` (que apaga no SQLite e atualiza a lista) |
| Função `confirmarExclusao()` | Encapsula o fluxo: pergunta → remove → volta |
| `style: 'destructive'` no botão "Excluir" do Alert | Padrão iOS/Android: o iOS pinta de vermelho automaticamente, sinalizando perigo |
| `removerTransacao(transacao.id)` seguido de `navigation.goBack()` | Apaga e retorna ao Dashboard, que re-renderiza sozinho via contexto |
| Estilos `botaoExcluir` e `textoExcluir` | Outline vermelho — ação destrutiva sem dominar a tela |
| `accessibilityRole` e `accessibilityLabel` | Leitores de tela anunciam "Excluir transação, botão" |

> **Por que outline em vez de fundo vermelho sólido?** O foco visual da tela é o **valor** da transação. Um botão sólido em vermelho competiria com ele e deixaria a tela visualmente "alarmada". O outline preserva a hierarquia: o valor continua sendo o protagonista, e o botão sinaliza claramente que é uma ação perigosa sem ofuscar o resto.

> **Por que `Alert.alert` e não um Modal customizado?** O `Alert.alert` é nativo, gratuito (sem código adicional), e respeita as convenções da plataforma — no iOS aparece como um popup central, no Android como um diálogo Material. Para uma confirmação simples de "sim/não", essa é a escolha certa. Modal customizado só faz sentido quando você precisa de campos de entrada ou layout específico do app.

### 7.2 — Roteiro de teste

1. Adicione algumas transações de teste no app
2. Toque em uma para abrir a tela de detalhe → o botão **Excluir** aparece abaixo da tabela
3. Toque em **Excluir** → o Alert nativo aparece com o nome da transação na pergunta
4. Toque em **Cancelar** → o Alert fecha, a transação continua lá ✅
5. Repita e toque em **Excluir** no Alert → volta ao Dashboard, transação sumiu da lista ✅
6. Feche e reabra o app → a transação excluída continua sumida (persistência confirmada) ✅
7. Confirme que o **toque longo** na lista do Dashboard ainda funciona como atalho

---

## Referência Rápida — Para Aprofundar

> Esta seção é **só para consulta**. Não é necessária para concluir o app — serve como guia de estudo para reforçar os conceitos de banco usados na aula. Use-a no seu ritmo.

### R1 — UPDATE: modificar registros existentes

A aula usa `INSERT`, `SELECT` e `DELETE`. O quarto comando essencial é o `UPDATE`, que altera colunas de uma linha que **já existe** no banco.

```sql
UPDATE transacoes
SET valor = ?, descricao = ?
WHERE id = ?;
```

Exemplo de função em JavaScript (referência — não precisa adicionar ao projeto agora):

```jsx
// Atualiza uma transação existente pelo id
export function atualizarTransacao(t) {
  db.runSync(
    'UPDATE transacoes SET descricao = ?, valor = ?, tipo = ?, categoria = ?, data = ? WHERE id = ?',
    [t.descricao, t.valor, t.tipo, t.categoria, t.data, t.id]
  );
}
```

> ⚠️ **Cuidado com `UPDATE` sem `WHERE`.** O comando `UPDATE transacoes SET valor = 0` (sem `WHERE`) zera **todas as linhas** da tabela. O `WHERE` é o que torna a operação cirúrgica. A mesma regra vale para `DELETE`.

---

### R2 — Por que usar `?` em vez de juntar strings (SQL injection)

Repare que todas as funções do banco usam `?` como marcador para os valores, e os valores entram em um array separado:

```jsx
// ✅ Forma correta — usa ? e passa os valores em um array
db.runSync(
  'INSERT INTO transacoes (id, descricao) VALUES (?, ?)',
  [t.id, t.descricao]
);
```

O que aconteceria se você juntasse a string assim?

```jsx
// ❌ NUNCA faça isso — vulnerável a SQL injection
db.runSync(
  `INSERT INTO transacoes (id, descricao) VALUES ('${t.id}', '${t.descricao}')`
);
```

Se o usuário digitasse na descrição algo como `'); DROP TABLE transacoes; --`, a string final viraria um comando que **apaga a tabela inteira**. Com `?`, o SQLite trata o texto sempre como **dado**, nunca como comando.

Mesmo num app local, sempre use `?`:

- Evita problemas com aspas e apóstrofes (ex.: descrição "Pão d'água" quebraria a string)
- O banco escapa os valores corretamente para você
- É o padrão profissional — você cria o hábito certo desde o primeiro dia

---

### R3 — Constraints: regras que o banco garante

No `CREATE TABLE` do Passo 2 já vimos `PRIMARY KEY` e `NOT NULL`. Existem outras restrições úteis:

| Constraint | O que faz | Exemplo |
|---|---|---|
| `PRIMARY KEY` | Identifica unicamente cada linha; não pode ser nula nem repetir | `id TEXT PRIMARY KEY` |
| `NOT NULL` | A coluna não aceita o valor `NULL` (vazio) | `valor REAL NOT NULL` |
| `DEFAULT` | Valor automático quando o INSERT não informa a coluna | `categoria TEXT DEFAULT 'Outros'` |
| `UNIQUE` | Não permite duas linhas com o mesmo valor nessa coluna | `email TEXT UNIQUE` |
| `CHECK` | Só aceita valores que satisfaçam a condição entre parênteses | `valor REAL CHECK (valor > 0)` |

Versão mais protegida da tabela `transacoes` (apenas para estudo):

```sql
CREATE TABLE IF NOT EXISTS transacoes (
  id        TEXT PRIMARY KEY,
  descricao TEXT NOT NULL,
  valor     REAL NOT NULL CHECK (valor > 0),
  tipo      TEXT NOT NULL CHECK (tipo IN ('receita', 'despesa')),
  categoria TEXT NOT NULL DEFAULT 'Outros',
  data      TEXT NOT NULL
);
```

> **Por que isso importa?** Se algum INSERT violar uma constraint, o banco rejeita a operação e lança um erro. Constraints transformam regras de negócio em garantias do banco — mesmo que o programador esqueça de validar no JavaScript, o banco não deixa o dado inconsistente entrar.

---

### R4 — DB Browser for SQLite: ferramenta de manutenção do banco

O **DB Browser for SQLite** é um programa gratuito que abre arquivos `.db` e mostra as tabelas como uma planilha. É a ferramenta padrão para **manutenção e inspeção** de bancos SQLite — tanto em desenvolvimento quanto em produção:

- Conferir o `CREATE TABLE` e os tipos de cada coluna
- Visualizar todas as linhas de uma tabela como planilha
- Executar `SELECT`, `UPDATE`, `INSERT` e `DELETE` manualmente, sem precisar mexer no código do app
- Importar/exportar dados em CSV ou SQL
- Corrigir registros, ajustar valores, popular o banco com dados de teste

#### Instalação

| Sistema | Como instalar |
|---|---|
| Windows | Baixe o `.exe` em [sqlitebrowser.org](https://sqlitebrowser.org) |
| macOS | `brew install --cask db-browser-for-sqlite` ou baixe pelo site |
| Linux (Ubuntu/Debian) | `sudo apt install sqlitebrowser` |

#### Principais abas

- **Database Structure** — mostra o `CREATE TABLE` que gerou cada tabela
- **Browse Data** — todas as linhas da tabela como planilha; permite editar diretamente
- **Execute SQL** — roda qualquer comando SQL manualmente para testar consultas

> 💡 Você pode criar um banco `.db` local no seu computador, brincar com `CREATE TABLE`, `INSERT` e `SELECT` no DB Browser e depois reaproveitar as queries no código do app — uma forma rápida de praticar SQL sem rodar o app a cada teste.

---

## Resultado Final

| Funcionalidade | Status |
|----------------|--------|
| Banco criado automaticamente | ✅ `CREATE TABLE IF NOT EXISTS` |
| Transações salvas em tabela SQL | ✅ `INSERT INTO` |
| Carregamento ao abrir o app | ✅ `SELECT * FROM` |
| Exclusão por id | ✅ `DELETE FROM WHERE` |
| API síncrona sem async/await | ✅ `expo-sqlite` sync API |
| Consultas avançadas (bônus) | ✅ `WHERE`, `SUM`, `BETWEEN` |
| Boas-vindas só no primeiro acesso | ✅ `AsyncStorage` + `PrimeiroAcessoContext` |
| Botão excluir na tela de detalhe | ✅ `Alert.alert` + `removerTransacao` + `goBack` |

---

## Resolução de Problemas

### "Cannot find module 'expo-sqlite'"
```bash
npx expo install expo-sqlite
```
Reinicie o servidor com `r` no terminal do Expo.

### O banco começa vazio mesmo tendo dados da Aula 4
Esperado — AsyncStorage e SQLite são armazenamentos independentes. Os dados do AsyncStorage não migram automaticamente para o SQLite. Em produção, você implementaria uma migração na primeira abertura após a atualização.

### "no such table: transacoes"
Confirme que `inicializarBanco()` é chamado antes de qualquer outra função do banco no `useEffect` do `TransacoesProvider`.

### Dados somem após fechar o app
Verifique se `inserirTransacao(novaTransacao)` está sendo chamado em `adicionarTransacao()` — a função do banco precisa ser chamada antes ou junto com o `setTransacoes`.

### "SharedArrayBuffer is not defined" (erro no web)
O `expo-sqlite` **não funciona na versão web** (`localhost:8082`). Ele depende de `SharedArrayBuffer`, que os browsers bloqueiam por segurança salvo com configurações especiais de servidor. Isso não é um bug — SQLite é uma tecnologia para dispositivos móveis e não tem suporte web estável no Expo.

**Solução: teste no emulador Android ou no celular.**

No terminal onde o Expo está rodando, pressione `a` para abrir no emulador Android, ou escaneie o QR code com o **Expo Go** no celular. Todos os recursos do SQLite funcionam normalmente nesses ambientes.

### "Unable to resolve ./wa-sqlite/wa-sqlite.wasm" (erro no web)
O `expo-sqlite` usa WebAssembly no navegador, e o Metro não reconhece arquivos `.wasm` por padrão. Crie o arquivo `metro.config.js` na raiz do projeto:
```js
const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);
config.resolver.assetExts.push('wasm');

module.exports = config;
```
Pare o servidor (`Ctrl + C`) e reinicie com `npx expo start`. O erro não aparece ao testar no emulador Android ou celular — apenas na versão web.

> 💡 **Dica — problemas de rede ao abrir no celular?** Se ao escanear o QR code o Expo exibir a tela **"Something went wrong"** (computador e celular em redes diferentes, ou rede Wi-Fi bloqueando conexões locais), reinicie com o parâmetro `--tunnel`:
>
> ```bash
> npx expo start --tunnel
> ```
>
> O modo tunnel cria uma conexão via internet (ngrok), dispensando que o celular esteja na mesma rede do computador. É mais lento, porém funciona em qualquer cenário de rede.
