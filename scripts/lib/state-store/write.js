const fs = require('fs');
const path = require('path');
const { DB_PATH, initDatabase } = require('./init');

async function openReadWrite() {
  const PLUGIN_ROOT = process.env.CLAUDE_PLUGIN_ROOT || path.resolve(__dirname, '..', '..', '..');
  const initSqlJs = require(path.join(PLUGIN_ROOT, 'vendor', 'sql.js'));
  if (!fs.existsSync(DB_PATH)) {
    await initDatabase();
  }
  const buffer = fs.readFileSync(DB_PATH);
  const SQL = await initSqlJs();
  const db = new SQL.Database(buffer);
  db.run('PRAGMA journal_mode=WAL');
  db.run('PRAGMA busy_timeout=5000');
  return db;
}

async function execute(sql, params = []) {
  const db = await openReadWrite();
  try {
    db.run(sql, params);
    const data = db.export();
    fs.writeFileSync(DB_PATH, Buffer.from(data));
  } finally {
    db.close();
  }
}

async function executeMany(statements) {
  const db = await openReadWrite();
  try {
    db.run('BEGIN TRANSACTION');
    for (const { sql, params } of statements) {
      db.run(sql, params || []);
    }
    db.run('COMMIT');
    const data = db.export();
    fs.writeFileSync(DB_PATH, Buffer.from(data));
  } catch (e) {
    db.run('ROLLBACK');
    throw e;
  } finally {
    db.close();
  }
}

module.exports = { execute, executeMany, openReadWrite };
