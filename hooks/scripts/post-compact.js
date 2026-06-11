#!/usr/bin/env node
'use strict';

// PostCompact: re-inyecta el digest de reglas núcleo — la compactación puede
// dejar fuera las reglas inyectadas en SessionStart por load-context.js.

const fs = require('fs');
const path = require('path');

const PLUGIN_ROOT = process.env.CLAUDE_PLUGIN_ROOT || path.resolve(__dirname, '..', '..');

try {
  const digest = fs.readFileSync(path.join(PLUGIN_ROOT, 'rules', 'DIGEST.md'), 'utf8').trim();
  if (digest) {
    process.stdout.write(JSON.stringify({
      hookSpecificOutput: {
        hookEventName: 'PostCompact',
        additionalContext: `El Coro sigue ACTIVO tras la compactación.\n\n${digest}`,
      },
    }));
  }
} catch (_) {
  // Sin digest no hay nada que re-inyectar — salir limpio.
}
process.exit(0);
