#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');

const PLUGIN_ROOT = process.env.CLAUDE_PLUGIN_ROOT || path.resolve(__dirname, '..', '..');

function readStdin() {
  return new Promise((resolve, reject) => {
    let data = '';
    process.stdin.setEncoding('utf8');
    process.stdin.on('data', chunk => { data += chunk; });
    process.stdin.on('end', () => {
      try { resolve(JSON.parse(data)); } catch (_) { resolve(null); }
    });
    process.stdin.on('error', reject);
  });
}

function estimateComplexity(task) {
  const desc = (task.description || task.name || '').toLowerCase();
  if (/refactor|migrat|redesign|architect/.test(desc)) return 'high';
  if (/fix|update|add|create|implement/.test(desc)) return 'medium';
  return 'low';
}

async function main() {
  try {
    const input = await readStdin();
    if (!input) { process.exit(0); return; }

    const logDir = path.join(PLUGIN_ROOT, 'sombra', 'session_log');
    if (!fs.existsSync(logDir)) fs.mkdirSync(logDir, { recursive: true });

    const date = new Date().toISOString().slice(0, 10);
    const entry = JSON.stringify({
      ts: new Date().toISOString(),
      event: 'task_created',
      task_type: input.type || input.task_type || 'unknown',
      complexity: estimateComplexity(input),
      name: (input.name || input.task_name || '').slice(0, 100),
    });
    fs.appendFileSync(path.join(logDir, `${date}.jsonl`), entry + '\n');

    // Update work_style patterns in profile (with file locking)
    const { updateProfile } = require('./lib/profile-lock');
    const complexity = estimateComplexity(input);
    updateProfile((profile) => {
      if (!profile.work_style || typeof profile.work_style !== 'object') {
        profile.work_style = { patterns: [], hours: {}, priorities: [] };
      }
      if (!Array.isArray(profile.work_style.patterns)) profile.work_style.patterns = [];
      const existing = profile.work_style.patterns.find(p => p.name === `prefers_${complexity}_tasks`);
      if (existing) {
        existing.count = (existing.count || 0) + 1;
      } else {
        profile.work_style.patterns.push({ name: `prefers_${complexity}_tasks`, count: 1 });
      }
    });
  } catch (_) {
    // Graceful degradation — async hook, never block
  }
  process.exit(0);
}

main();
