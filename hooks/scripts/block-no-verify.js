#!/usr/bin/env node
'use strict';

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

async function main() {
  try {
    const input = await readStdin();
    if (!input || !input.tool_input || !input.tool_input.command) {
      process.exit(0);
      return;
    }

    const cmd = input.tool_input.command;

    if (/--no-verify\b/.test(cmd)) {
      process.stderr.write('BLOQUEADO: --no-verify no permitido. Los hooks de git existen por una razon.');
      process.exit(2);
      return;
    }
  } catch (_) {
    // Graceful degradation
  }

  process.exit(0);
}

main();
