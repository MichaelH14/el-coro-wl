#!/usr/bin/env node
'use strict';

const path = require('path');
const fs = require('fs');
const crypto = require('crypto');

const PLUGIN_ROOT = process.env.CLAUDE_PLUGIN_ROOT || path.resolve(__dirname, '..', '..');

async function main() {
  try {
    const dbPath = path.join(PLUGIN_ROOT, 'state', 'el-coro.db');

    // If no database exists, nothing to do
    if (!fs.existsSync(dbPath)) {
      process.exit(0);
      return;
    }

    // Load sql.js from vendored copy (committed to repo, available in plugin cache)
    let initSqlJs;
    try {
      initSqlJs = require(path.join(PLUGIN_ROOT, 'vendor', 'sql.js'));
    } catch (_) {
      // sql.js not available, skip session logging
      process.exit(0);
      return;
    }

    const SQL = await initSqlJs();
    const buffer = fs.readFileSync(dbPath);
    const db = new SQL.Database(buffer);

    const sessionId = crypto.randomUUID();
    const now = new Date().toISOString();

    // Read actual session start time recorded by load-context.js
    let startedAt = now;
    const sessionStartPath = path.join(PLUGIN_ROOT, 'state', 'session-start.json');
    try {
      const startData = JSON.parse(fs.readFileSync(sessionStartPath, 'utf8'));
      if (startData.started_at) startedAt = startData.started_at;
      fs.unlinkSync(sessionStartPath);
    } catch (_) {}

    db.run(
      `INSERT INTO sessions (id, started_at, ended_at, summary) VALUES (?, ?, ?, ?)`,
      [sessionId, startedAt, now, 'Session ended via Stop hook']
    );

    // Persist
    const data = db.export();
    fs.writeFileSync(dbPath, Buffer.from(data));
    db.close();

    // Reset cortex session_new counter so next session can learn new instincts
    const instPath = path.join(PLUGIN_ROOT, 'state', 'instincts.json');
    try {
      const instData = JSON.parse(fs.readFileSync(instPath, 'utf8'));
      instData.session_new = 0;
      instData._session_date = null;
      const tmp = instPath + '.tmp';
      fs.writeFileSync(tmp, JSON.stringify(instData, null, 2));
      fs.renameSync(tmp, instPath);
    } catch (_) {}
  } catch (_) {
    // Graceful degradation — never fail on Stop
  }

  process.exit(0);
}

main();
