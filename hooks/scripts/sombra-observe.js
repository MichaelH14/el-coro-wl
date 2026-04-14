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

function inferDomain(toolName) {
  const map = {
    Bash: 'tool_preferences', Write: 'code_style', Edit: 'code_style',
    Read: 'tool_preferences', Grep: 'tool_preferences', Glob: 'tool_preferences',
  };
  return map[toolName] || 'work_patterns';
}

async function main() {
  try {
    const input = await readStdin();
    if (!input || !input.tool_name) { process.exit(0); return; }

    const domain = inferDomain(input.tool_name);

    updateProfile((profile) => {
      if (profile.domain_confidence && domain in profile.domain_confidence) {
        profile.domain_confidence[domain] = Math.min(1.0,
          (profile.domain_confidence[domain] || 0) + 0.01);
      }
    });

    // Append to session log
    const logDir = path.join(PLUGIN_ROOT, 'sombra', 'session_log');
    if (!fs.existsSync(logDir)) fs.mkdirSync(logDir, { recursive: true });
    const date = new Date().toISOString().slice(0, 10);
    const entry = JSON.stringify({
      ts: new Date().toISOString(), tool: input.tool_name, domain,
      intent: input.tool_input ? Object.keys(input.tool_input).join(',') : '',
    });
    fs.appendFileSync(path.join(logDir, `${date}.jsonl`), entry + '\n');
  } catch (_) {
    // Graceful degradation — async hook, never block
  }
  process.exit(0);
}

main();
