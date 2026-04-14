#!/usr/bin/env node
'use strict';

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

const FILE_GROUPS = [
  { test: /\/(routes?|api)\//i, remind: 'Editando ruta/API — recuerda actualizar tests y tipos.' },
  { test: /\.(tsx|jsx)$/i, remind: 'Editando componente — recuerda revisar estilos y tests asociados.' },
  { test: /migration/i, remind: 'Editando migracion — recuerda crear rollback.' },
  { test: /schema\.(ts|prisma|sql)$/i, remind: 'Editando schema — recuerda actualizar tipos y migraciones.' },
  { test: /\.config\.(ts|js|json)$/i, remind: 'Editando config — recuerda verificar env de produccion.' },
];

async function main() {
  try {
    const input = await readStdin();
    if (!input || !input.tool_input || !input.tool_input.file_path) {
      process.exit(0);
      return;
    }

    const filePath = input.tool_input.file_path;

    for (const { test, remind } of FILE_GROUPS) {
      if (test.test(filePath)) {
        process.stdout.write(JSON.stringify({ systemMessage: remind }));
        break;
      }
    }
  } catch (_) {
    // Graceful degradation — informational, never block
  }
  process.exit(0);
}

main();
