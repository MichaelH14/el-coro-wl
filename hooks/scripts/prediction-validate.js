#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');

const PLUGIN_ROOT = process.env.CLAUDE_PLUGIN_ROOT || path.resolve(__dirname, '..', '..');

function loadJson(filePath) {
  try { return JSON.parse(fs.readFileSync(filePath, 'utf8')); } catch (_) { return null; }
}

function saveJson(filePath, data) {
  const dir = path.dirname(filePath);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  const tmp = filePath + '.tmp';
  fs.writeFileSync(tmp, JSON.stringify(data, null, 2));
  fs.renameSync(tmp, filePath);
}

async function main() {
  try {
    const predDir = path.join(PLUGIN_ROOT, 'sombra', 'predictions');
    const pendingPath = path.join(predDir, 'pending.json');
    const resolvedPath = path.join(predDir, 'resolved.json');

    const pending = loadJson(pendingPath);
    if (!pending || !Array.isArray(pending.predictions) || pending.predictions.length === 0) {
      process.exit(0);
      return;
    }

    const resolved = loadJson(resolvedPath) || { predictions: [] };
    const sessionLogs = [];

    // Load today's session log for evidence
    const logDir = path.join(PLUGIN_ROOT, 'sombra', 'session_log');
    const date = new Date().toISOString().slice(0, 10);
    const logPath = path.join(logDir, `${date}.jsonl`);
    try {
      const lines = fs.readFileSync(logPath, 'utf8').trim().split('\n');
      for (const l of lines) { try { sessionLogs.push(JSON.parse(l)); } catch (_) {} }
    } catch (_) {}

    const remaining = [];
    const domainHits = {};

    for (const pred of pending.predictions) {
      const evidence = sessionLogs.some(e => e.domain === pred.domain || e.tool === pred.expected_tool);
      if (evidence || pred.expires_at && new Date(pred.expires_at) < new Date()) {
        pred.was_correct = evidence;
        pred.resolved_at = new Date().toISOString();
        resolved.predictions.push(pred);
        const d = pred.domain || 'unknown';
        if (!domainHits[d]) domainHits[d] = { correct: 0, total: 0 };
        domainHits[d].total++;
        if (evidence) domainHits[d].correct++;
      } else {
        remaining.push(pred);
      }
    }

    saveJson(pendingPath, { predictions: remaining });
    saveJson(resolvedPath, resolved);

    // Update domain confidence based on accuracy (with file locking)
    const { updateProfile } = require('./lib/profile-lock');
    if (Object.keys(domainHits).length > 0) {
      updateProfile((profile) => {
        if (!profile.domain_confidence) return;
        for (const [domain, stats] of Object.entries(domainHits)) {
          if (domain in profile.domain_confidence && stats.total > 0) {
            const accuracy = stats.correct / stats.total;
            profile.domain_confidence[domain] = Math.min(1.0,
              (profile.domain_confidence[domain] || 0) + (accuracy * 0.05));
          }
        }
      });
    }
  } catch (_) {
    // Graceful degradation — never fail on Stop
  }
  process.exit(0);
}

main();
