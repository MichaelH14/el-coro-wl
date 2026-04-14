#!/usr/bin/env node
'use strict';

const { execFileSync } = require('child_process');
const path = require('path');
const fs = require('fs');

function readStdin() {
  return new Promise((resolve, reject) => {
    let data = '';
    process.stdin.setEncoding('utf8');
    process.stdin.on('data', chunk => { data += chunk; });
    process.stdin.on('end', () => {
      try {
        resolve(JSON.parse(data));
      } catch (_) {
        resolve(null);
      }
    });
    process.stdin.on('error', reject);
  });
}

function findProjectRoot(filePath) {
  let dir = path.dirname(filePath);
  while (dir !== path.dirname(dir)) {
    if (fs.existsSync(path.join(dir, 'package.json'))) {
      return dir;
    }
    dir = path.dirname(dir);
  }
  return null;
}

async function main() {
  try {
    const input = await readStdin();
    if (!input || !input.tool_input || !input.tool_input.file_path) {
      process.exit(0);
      return;
    }

    const filePath = input.tool_input.file_path;

    // Only lint JS/TS files
    const ext = path.extname(filePath);
    if (!['.js', '.jsx', '.ts', '.tsx', '.mjs', '.cjs'].includes(ext)) {
      process.exit(0);
      return;
    }

    // File must exist
    if (!fs.existsSync(filePath)) {
      process.exit(0);
      return;
    }

    const projectRoot = findProjectRoot(filePath);
    if (!projectRoot) {
      process.exit(0);
      return;
    }

    try {
      const output = execFileSync('npx', ['eslint', '--no-error-on-unmatched-pattern', filePath], {
        cwd: projectRoot,
        encoding: 'utf8',
        timeout: 12000,
        stdio: 'pipe',
      });
      if (output.trim()) {
        process.stderr.write(`[lint-check] ${output}\n`);
      }
    } catch (err) {
      if (err.stdout && err.stdout.trim()) {
        process.stderr.write(`[lint-check] Errores de lint:\n${err.stdout}\n`);
      }
    }
  } catch (_) {
    // Graceful degradation — async hook, never block
  }

  process.exit(0);
}

main();
