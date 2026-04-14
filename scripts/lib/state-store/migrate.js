const fs = require('fs');
const path = require('path');
const { DB_PATH, initDatabase } = require('./init');
const { backupDatabase } = require('./backup');

async function migrate() {
  if (fs.existsSync(DB_PATH)) {
    console.log('Existing database found. Creating backup before migration...');
    backupDatabase();
  }
  const dbPath = await initDatabase();
  console.log(`Migration complete: ${dbPath}`);
}

if (require.main === module) {
  migrate().catch(e => { console.error(e); process.exit(1); });
}

module.exports = { migrate };
