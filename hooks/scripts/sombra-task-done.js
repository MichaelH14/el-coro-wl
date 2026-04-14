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

const { updateProfile } = require('./lib/profile-lock');

async function main() {
  try {
    const input = await readStdin();
    if (!input) { process.exit(0); return; }

    const accepted = input.status === 'accepted' || input.status === 'completed';
    const rejected = input.status === 'rejected' || input.status === 'failed';
    const reason = input.rejection_reason || input.feedback || '';

    // Log to session
    const logDir = path.join(PLUGIN_ROOT, 'sombra', 'session_log');
    if (!fs.existsSync(logDir)) fs.mkdirSync(logDir, { recursive: true });
    const date = new Date().toISOString().slice(0, 10);
    const entry = JSON.stringify({
      ts: new Date().toISOString(),
      event: 'task_done',
      accepted,
      rejected,
      reason: reason.slice(0, 200),
      name: (input.name || input.task_name || '').slice(0, 100),
    });
    fs.appendFileSync(path.join(logDir, `${date}.jsonl`), entry + '\n');

    // Update profile based on outcome (with file locking)
    updateProfile((profile) => {
      if (!profile.triggers || typeof profile.triggers !== 'object') {
        profile.triggers = { frustration: [], satisfaction: [] };
      }
      if (rejected && reason) {
        if (!Array.isArray(profile.triggers.frustration)) profile.triggers.frustration = [];
        const exists = profile.triggers.frustration.find(t => t.pattern === reason.slice(0, 80));
        if (exists) {
          exists.count = (exists.count || 0) + 1;
        } else if (profile.triggers.frustration.length < 50) {
          profile.triggers.frustration.push({ pattern: reason.slice(0, 80), count: 1 });
        }
      }
      if (accepted) {
        if (profile.domain_confidence && profile.domain_confidence.work_patterns !== undefined) {
          profile.domain_confidence.work_patterns = Math.min(1.0,
            (profile.domain_confidence.work_patterns || 0) + 0.02);
        }
      }
    });
  } catch (_) {
    // Graceful degradation — async hook, never block
  }
  process.exit(0);
}

main();
