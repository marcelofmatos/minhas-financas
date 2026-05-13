// database/db.js
import * as SQLite from 'expo-sqlite';

let db;

// Cria a tabela se ainda não existir
export async function inicializarBanco() {
  db = await SQLite.openDatabaseAsync('minhasfinancas.db');
  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS transacoes (
      id          TEXT PRIMARY KEY,
      descricao   TEXT NOT NULL,
      valor       REAL NOT NULL,
      tipo        TEXT NOT NULL,
      categoria   TEXT NOT NULL,
      data        TEXT NOT NULL,
      latitude    REAL,
      longitude   REAL,
      comprovante TEXT
    );
  `);

  // Migração para quem já tinha o banco da aula anterior sem as colunas novas.
  // PRAGMA table_info devolve as colunas existentes — só executa ALTER se ainda não existirem.
  const colunas = await db.getAllAsync('PRAGMA table_info(transacoes)');
  const nomes = colunas.map(c => c.name);
  if (!nomes.includes('latitude')) {
    await db.execAsync('ALTER TABLE transacoes ADD COLUMN latitude REAL');
    await db.execAsync('ALTER TABLE transacoes ADD COLUMN longitude REAL');
  }
  if (!nomes.includes('comprovante')) {
    await db.execAsync('ALTER TABLE transacoes ADD COLUMN comprovante TEXT');
  }
}

// Retorna todas as transações, mais recentes primeiro
export async function buscarTodasTransacoes() {
  return await db.getAllAsync(
    'SELECT * FROM transacoes ORDER BY rowid DESC'
  );
}

// Insere uma nova transação
export async function inserirTransacao(t) {
  await db.runAsync(
    `INSERT INTO transacoes
      (id, descricao, valor, tipo, categoria, data, latitude, longitude, comprovante)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      t.id,
      t.descricao,
      t.valor,
      t.tipo,
      t.categoria,
      t.data,
      t.latitude    ?? null,
      t.longitude   ?? null,
      t.comprovante ?? null,
    ]
  );
}

// Atualiza uma transação existente pelo id.
// `data` (data de criação) NÃO é atualizada — preserva o registro original.
export async function atualizarTransacao(t) {
  await db.runAsync(
    `UPDATE transacoes
        SET descricao=?, valor=?, tipo=?, categoria=?,
            latitude=?, longitude=?, comprovante=?
      WHERE id = ?`,
    [
      t.descricao,
      t.valor,
      t.tipo,
      t.categoria,
      t.latitude    ?? null,
      t.longitude   ?? null,
      t.comprovante ?? null,
      t.id,
    ]
  );
}

// Remove uma transação pelo id
export async function excluirTransacao(id) {
  await db.runAsync('DELETE FROM transacoes WHERE id = ?', [id]);
}

// ---------------------------------------------------------------------------
// Bônus — STEPS.md Passo 4.2 (debug opcional)
// Descomente temporariamente para inspecionar o conteúdo da tabela no console.
// ---------------------------------------------------------------------------
// export async function logTransacoes() {
//   const dados = await db.getAllAsync('SELECT * FROM transacoes');
//   console.log('Transações no banco:', JSON.stringify(dados, null, 2));
// }

// ---------------------------------------------------------------------------
// Bônus — STEPS.md Passo 5 (consultas avançadas com SQL)
// Demonstram o poder do SQL para filtrar diretamente no banco, sem trazer
// tudo para o JavaScript. Não são usadas na tela ainda — descomente quando
// for consumir em algum componente.
// ---------------------------------------------------------------------------

// Busca apenas despesas de uma categoria
// export async function buscarPorCategoria(categoria) {
//   return await db.getAllAsync(
//     'SELECT * FROM transacoes WHERE categoria = ? ORDER BY rowid DESC',
//     [categoria]
//   );
// }

// Soma total por tipo
// export async function totalPorTipo(tipo) {
//   const resultado = await db.getFirstAsync(
//     'SELECT SUM(valor) as total FROM transacoes WHERE tipo = ?',
//     [tipo]
//   );
//   return resultado?.total ?? 0;
// }

// Busca transações de um período
// export async function buscarPorPeriodo(dataInicio, dataFim) {
//   return await db.getAllAsync(
//     'SELECT * FROM transacoes WHERE data BETWEEN ? AND ? ORDER BY data DESC',
//     [dataInicio, dataFim]
//   );
// }
