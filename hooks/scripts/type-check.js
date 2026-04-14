#!/usr/bin/env node
'use strict';

const { execSync } = require('child_process');
const path = require('path');

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
  const fs = require('fs');
  while (dir !== path.dirname(dir)) {
    if (fs.existsSync(path.join(dir, 'tsconfig.json'))) {
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

    // Only check TypeScript files
    if (!filePath.endsWith('.ts') && !filePath.endsWith('.tsx')) {
      process.exit(0);
      return;
    }

    const projectRoot = findProjectRoot(filePath);
    if (!projectRoot) {
      process.exit(0);
      return;
    }

    try {
      execSync('npx tsc --noEmit --pretty 2>&1', {
        cwd: projectRoot,
        encoding: 'utf8',
        timeout: 25000,
      });
    } catch (err) {
      // tsc exits non-zero on type errors — that's expected
      if (err.stdout) {
        process.stderr.write(`[type-check] Errores de tipo detectados:\n${err.stdout}\n`);
      }
    }
  } catch (_) {
    // Graceful degradation — async hook, never block
  }

  process.exit(0);
}

main();
