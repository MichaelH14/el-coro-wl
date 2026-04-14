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
    if (!input || !input.tool_input) {
      process.exit(0);
      return;
    }

    const filePath = input.tool_input.file_path || '';
    const text = input.tool_input.new_string || input.tool_input.content || '';

    // Only warn for frontend files — console.log is valid in backend/server code
    const isBackend = /\/(server|api|scripts|hooks|workers?|vps)\//i.test(filePath)
      || /\.(cjs|mjs)$/.test(filePath)
      || /worker\.js$/.test(filePath);

    if (!isBackend && text.includes('console.log')) {
      process.stdout.write(JSON.stringify({
        systemMessage: 'AVISO: Se detecto console.log — probable codigo de debug. Recuerda removerlo antes de commit.'
      }));
    }
  } catch (_) {
    // Graceful degradation
  }

  process.exit(0);
}

main();
