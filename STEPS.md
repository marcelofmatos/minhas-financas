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
