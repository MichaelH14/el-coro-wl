#!/usr/bin/env node
'use strict';

const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

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

function findProjectRoot(filePath) {
  let dir = path.dirname(filePath);
  while (dir !== path.dirname(dir)) {
    if (fs.existsSync(path.join(dir, 'package.json'))) return dir;
    dir = path.dirname(dir);
  }
  return null;
}

function runCheck(cmd, cwd, timeout) {
  try {
    execSync(cmd, { cwd, encoding: 'utf8', timeout, stdio: 'pipe' });
    return null;
  } catch (err) {
    return (err.stdout || err.stderr || err.message).slice(0, 500);
  }
}

async function main() {
  try {
    const input = await readStdin();
    if (!input) { process.exit(0); return; }

    // Try to infer project root from task files
    const files = input.files_changed || input.deliverables || [];
    const roots = new Set();
    for (const f of files) {
      const root = findProjectRoot(f);
      if (root) roots.add(root);
    }

    const errors = [];
    for (const root of roots) {
      const pkg = path.join(root, 'package.json');
      if (!fs.existsSync(pkg)) continue;
      const pkgJson = JSON.parse(fs.readFileSync(pkg, 'utf8'));
      const scripts = pkgJson.scripts || {};

      if (scripts.build) {
        const err = runCheck('npm run build 2>&1', root, 30000);
        if (err) errors.push(`Build failed in ${root}:\n${err}`);
      }
      if (scripts.lint) {
        const err = runCheck('npm run lint 2>&1', root, 15000);
        if (err) errors.push(`Lint failed in ${root}:\n${err}`);
      }
      if (scripts.test) {
        const err = runCheck('npm test 2>&1', root, 30000);
        if (err) errors.push(`Tests failed in ${root}:\n${err}`);
      }
    }

    if (errors.length > 0) {
      process.stderr.write(`QA Gate: Checks failed.\n${errors.join('\n---\n')}`);
      process.exit(2);
      return;
    }
  } catch (_) {
    // Graceful degradation — if checks can't run, don't block
  }
  process.exit(0);
}

main();
