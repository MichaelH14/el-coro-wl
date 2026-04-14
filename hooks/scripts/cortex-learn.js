#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');

const PLUGIN_ROOT = process.env.CLAUDE_PLUGIN_ROOT || path.resolve(__dirname, '..', '..');
const MAX_NEW_INSTINCTS_PER_SESSION = 5;

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

function classifyPattern(filePath, content) {
  const ext = path.extname(filePath);
  if (!['.ts', '.tsx', '.js'].includes(ext)) return null;
  const patterns = [];
  if (content.includes('import ')) patterns.push('uses-imports');
  if (content.includes('async ')) patterns.push('async-pattern');
  if (content.includes('try {') || content.includes('try{')) patterns.push('error-handling');
  if (/\.(map|filter|reduce)\(/.test(content)) patterns.push('functional-style');
  if (content.includes('interface ') || content.includes('type ')) patterns.push('type-definitions');
  return patterns.length > 0 ? patterns : null;
}

function loadInstincts() {
  const p = path.join(PLUGIN_ROOT, 'state', 'instincts.json');
  const sessionId = process.env.CLAUDE_SESSION_ID || process.env.CLAUDE_CODE_SESSION_ID || '';
  try {
    const data = JSON.parse(fs.readFileSync(p, 'utf8'));
    // Reset session_new if different session or different date
    const today = new Date().toISOString().slice(0, 10);
    if (data._session_date !== today || (sessionId && data._session_id !== sessionId)) {
      data.session_new = 0;
      data._session_date = today;
      if (sessionId) data._session_id = sessionId;
    }
    return data;
  } catch (_) {
    return { instincts: [], session_new: 0, _session_date: new Date().toISOString().slice(0, 10), _session_id: sessionId };
  }
}

function saveInstincts(data) {
  const dir = path.join(PLUGIN_ROOT, 'state');
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  const p = path.join(dir, 'instincts.json');
  const tmp = p + '.tmp';
  fs.writeFileSync(tmp, JSON.stringify(data, null, 2));
  fs.renameSync(tmp, p);
}

async function main() {
  try {
    const input = await readStdin();
    if (!input || !input.tool_input) { process.exit(0); return; }

    const filePath = input.tool_input.file_path;
    const content = input.tool_input.content || input.tool_input.new_string || '';
    if (!filePath || !content) { process.exit(0); return; }

    const patterns = classifyPattern(filePath, content);
    if (!patterns) { process.exit(0); return; }

    const data = loadInstincts();

    for (const pat of patterns) {
      const existing = data.instincts.find(i => i.pattern === pat);
      if (existing) {
        existing.evidence_count = (existing.evidence_count || 0) + 1;
        existing.confidence = Math.min(1.0, existing.confidence + 0.02);
        existing.last_seen = new Date().toISOString();
      } else if ((data.session_new || 0) < MAX_NEW_INSTINCTS_PER_SESSION) {
        data.instincts.push({
          pattern: pat, confidence: 0.3, evidence_count: 1,
          created: new Date().toISOString(), last_seen: new Date().toISOString(),
        });
        data.session_new = (data.session_new || 0) + 1;
      }
    }

    saveInstincts(data);
  } catch (_) {
    // Graceful degradation — async hook, never block
  }
  process.exit(0);
}

main();
