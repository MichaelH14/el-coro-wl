const fs = require('fs');
const path = require('path');
const { DB_PATH } = require('./init');

async function openReadOnly() {
  const PLUGIN_ROOT = process.env.CLAUDE_PLUGIN_ROOT || path.resolve(__dirname, '..', '..', '..');
  const initSqlJs = require(path.join(PLUGIN_ROOT, 'vendor', 'sql.js'));
  if (!fs.existsSync(DB_PATH)) {
    throw new Error(`State store not found at ${DB_PATH}. Run init first.`);
  }
  const buffer = fs.readFileSync(DB_PATH);
  const SQL = await initSqlJs();
  return new SQL.Database(buffer);
}

async function query(sql, params = []) {
  const db = await openReadOnly();
  try {
    const result = db.exec(sql, params);
    if (result.length === 0) return [];
    const { columns, values } = result[0];
    return values.map(row => {
      const obj = {};
      columns.forEach((col, i) => { obj[col] = row[i]; });
      return obj;
    });
  } finally {
    db.close();
  }
}

module.exports = { query, openReadOnly };
