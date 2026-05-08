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