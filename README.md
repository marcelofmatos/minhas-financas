# Aula 05 — Armazenamento com SQLite

## Objetivos da Aula

Comparar AsyncStorage e SQLite, criar e operar um banco local com `expo-sqlite` e escrever consultas com `WHERE`, `ORDER BY` e `SUM`.

---

## Pré-Requisitos — Configure Antes de Começar

### Ambiente base (deve estar instalado)

| Item | Verificar com |
|---|---|
| Node.js 20.x | `node -v` |
| Expo CLI | `expo --version` |
| Android Studio + AVD rodando | `adb devices` |
| Projeto `minhas-financas` das aulas 2–4 | `npx expo start` + tecla `a` |

### Pacote novo — instalar no início da aula

```bash
npx expo install expo-sqlite
```

---

## Conteúdo Teórico

### O que é SQLite?

SQLite é um banco de dados relacional que roda localmente no dispositivo — sem servidor, sem conexão de rede. É o banco de dados mais utilizado no mundo, presente em todos os iPhones, Androids, browsers e sistemas operacionais.

### Por que usar SQLite em vez de AsyncStorage?

O AsyncStorage é ótimo para armazenar preferências e listas pequenas, mas tem limitações quando os dados crescem ou precisam de filtros. O SQLite resolve isso:

```
AsyncStorage:
  salvar → JSON.stringify(lista inteira) → sobrescreve tudo
  ler    → JSON.parse(tudo) → filtra no JavaScript

SQLite:
  salvar → INSERT INTO transacoes VALUES (...)
  ler    → SELECT * FROM transacoes WHERE tipo = 'despesa'
```

### Conceitos SQL usados nesta aula

| Comando | Exemplo | O que faz |
|---------|---------|-----------|
| `CREATE TABLE` | `CREATE TABLE IF NOT EXISTS transacoes (...)` | Cria a tabela |
| `INSERT INTO` | `INSERT INTO transacoes VALUES (?, ...)` | Adiciona um registro |
| `SELECT` | `SELECT * FROM transacoes` | Busca registros |
| `DELETE` | `DELETE FROM transacoes WHERE id = ?` | Remove um registro |
| `WHERE` | `WHERE tipo = 'despesa'` | Filtra resultados |
| `ORDER BY` | `ORDER BY rowid DESC` | Ordena resultados |
| `SUM` | `SELECT SUM(valor) FROM transacoes` | Soma valores |

### API Síncrona do expo-sqlite

O `expo-sqlite` moderno oferece métodos síncronos que simplificam o código:

```jsx
db.execSync('CREATE TABLE ...')        // executa sem retorno
db.runSync('INSERT INTO ...', params)  // executa com parâmetros
db.getAllSync('SELECT * FROM ...')     // retorna array de objetos
db.getFirstSync('SELECT ...')         // retorna primeiro resultado
```

> **Por que síncrono se operações de I/O costumam ser async?** O `expo-sqlite` executa o banco em uma thread separada internamente. A API síncrona é uma abstração que não trava a UI — você ganha a simplicidade de código linear sem `async/await`.

---

### Comparação prática: AsyncStorage vs SQLite

```
AsyncStorage — como ele trabalha:
  salvar → JSON.stringify(lista inteira) → sobrescreve tudo no disco
  ler    → JSON.parse(tudo) → filtra no JavaScript

SQLite — como ele trabalha:
  salvar → INSERT INTO transacoes VALUES (?)   ← só o novo registro
  ler    → SELECT * FROM transacoes WHERE tipo = 'despesa'  ← filtrado no banco
```

A diferença cresce com o volume: para 10 transações AsyncStorage é ótimo; para 10.000 transações SQLite é obrigatório.

---

### Consultas avançadas com SQL

Uma das grandes vantagens do SQLite é filtrar diretamente no banco sem carregar tudo para o JavaScript — `WHERE`, `SUM` e `BETWEEN` executam no banco antes de qualquer código JavaScript.

> **Atividade prática (bônus):** As funções `buscarPorCategoria`, `totalPorTipo` e `buscarPorPeriodo` estão no [conteúdo complementar](./STEPS.md) — Passo 5.

### Migração de AsyncStorage para SQLite

Ao trocar de AsyncStorage para SQLite em produção, os dados existentes precisam ser migrados. A estratégia recomendada:

```jsx
useEffect(() => {
  inicializarBanco();

  // Na primeira abertura após atualização, migra dados antigos:
  async function migrarSeNecessario() {
    const jaFezMigracao = await AsyncStorage.getItem('@app:migrado');
    if (jaFezMigracao) return;

    const json = await AsyncStorage.getItem('@minhasfinancas:transacoes');
    if (json) {
      const transacoes = JSON.parse(json);
      transacoes.forEach(t => inserirTransacao(t));
    }
    await AsyncStorage.setItem('@app:migrado', 'sim');
  }

  migrarSeNecessario();
  carregarTransacoes();
}, []);
```

---

## Estrutura de arquivos ao final da aula

```
minhas-financas/
├── database/
│   └── db.js                ← NOVO: helper do banco SQLite
├── context/
│   └── TransacoesContext.js ← ATUALIZADO: usa SQLite
└── ...
```

---

## Projeto de demonstração em sala

### Como rodar

```bash
cd minhas-financas
npx expo start
```

> **Atenção:** `expo-sqlite` **não funciona na versão web** (`localhost:8082`). Sempre teste no emulador Android (tecla `a`) ou no celular com Expo Go.

### O que o demo mostra

| Funcionalidade | Conceito demonstrado |
|----------------|----------------------|
| Banco criado automaticamente | `CREATE TABLE IF NOT EXISTS` |
| Transações persistem ao fechar | `INSERT INTO` + `SELECT *` |
| Exclusão por id | `DELETE FROM WHERE id = ?` |
| Funções avançadas (bônus) | `WHERE`, `SUM`, `BETWEEN` |
| API síncrona sem async/await | `execSync`, `runSync`, `getAllSync` |

### Estrutura do projeto demo

```
minhas-financas/
├── database/
│   └── db.js                 # helper com todas as funções SQL
├── context/
│   └── TransacoesContext.js  # usa SQLite (não mais AsyncStorage)
└── ...
```

---

---

---


## Referências

- [Documentação expo-sqlite](https://docs.expo.dev/versions/latest/sdk/sqlite/)
- [Tutorial SQLite — W3Schools](https://www.w3schools.com/sql/)
- [SQLite Browser](https://sqlitebrowser.org/) — visualizar o banco no computador
