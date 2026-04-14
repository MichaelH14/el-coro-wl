// NOTE: sql.js operates in-memory and serializes to disk on save.
// WAL mode (PRAGMA journal_mode=WAL) has no real effect here — there is no
// file-level WAL journal. Concurrent-safe reads/writes are NOT supported.
// This state store assumes single-writer access only. Do not attempt to open
// the database from multiple processes simultaneously.

const fs = require('fs');
const path = require('path');

const PLUGIN_ROOT = process.env.CLAUDE_PLUGIN_ROOT || path.resolve(__dirname, '..', '..', '..');
const DB_PATH = path.join(PLUGIN_ROOT, 'state', 'el-coro.db');
const SCHEMA_PATH = path.join(__dirname, 'schema.sql');

async function initDatabase() {
  const initSqlJs = require(path.join(PLUGIN_ROOT, 'vendor', 'sql.js'));
  const stateDir = path.dirname(DB_PATH);

  if (!fs.existsSync(stateDir)) {
    fs.mkdirSync(stateDir, { recursive: true });
  }

  let db;
  if (fs.existsSync(DB_PATH)) {
    const buffer = fs.readFileSync(DB_PATH);
    const SQL = await initSqlJs();
    db = new SQL.Database(buffer);
  } else {
    const SQL = await initSqlJs();
    db = new SQL.Database();
  }

  // Enable WAL mode for concurrent reads
  db.run('PRAGMA journal_mode=WAL');
  db.run('PRAGMA busy_timeout=5000');

  // Run schema
  const schema = fs.readFileSync(SCHEMA_PATH, 'utf8');
  db.run(schema);

  // Save to disk
  const data = db.export();
  const buffer = Buffer.from(data);
  fs.writeFileSync(DB_PATH, buffer);

  db.close();
  return DB_PATH;
}

if (require.main === module) {
  initDatabase()
    .then(p => console.log(`State store initialized: ${p}`))
    .catch(e => { console.error(e); process.exit(1); });
}

module.exports = { initDatabase, DB_PATH };
