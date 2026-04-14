const fs = require('fs');
const path = require('path');
const { DB_PATH } = require('./init');

function backupDatabase() {
  if (!fs.existsSync(DB_PATH)) {
    console.log('No database to backup');
    return null;
  }
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const backupPath = `${DB_PATH}.backup-${timestamp}`;
  fs.copyFileSync(DB_PATH, backupPath);
  console.log(`Backup created: ${backupPath}`);
  return backupPath;
}

if (require.main === module) {
  backupDatabase();
}

module.exports = { backupDatabase };
