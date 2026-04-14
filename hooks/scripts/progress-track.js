#!/usr/bin/env node
'use strict';

// Lightweight PostToolUse hook — tracks El Coro work progress
// Writes to /tmp/el-coro-work so the status line can show a progress bar

const fs = require('fs');
const PROGRESS_FILE = '/tmp/el-coro-work';
const IDLE_THRESHOLD = 5000; // 5 seconds without activity = idle

function main() {
  const now = Date.now();
  let data;

  try {
    const raw = fs.readFileSync(PROGRESS_FILE, 'utf8').trim();
    data = JSON.parse(raw);
  } catch (_) {
    data = null;
  }

  // If no previous data, or last activity was more than 5s ago, start fresh
  if (!data || (now - data.last) > IDLE_THRESHOLD) {
    data = { start: now, last: now, steps: 1 };
  } else {
    data.last = now;
    data.steps++;
  }

  fs.writeFileSync(PROGRESS_FILE, JSON.stringify(data));
}

// Read stdin (required by hook protocol) then run
let buf = '';
process.stdin.setEncoding('utf8');
process.stdin.on('data', c => { buf += c; });
process.stdin.on('end', () => { main(); process.exit(0); });
process.stdin.resume();
