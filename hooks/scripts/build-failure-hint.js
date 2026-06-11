#!/usr/bin/env node
'use strict';

// PostToolUseFailure (Bash): si lo que falló fue un build/test, recordar el
// flujo de El Coro antes de que se parchee el síntoma a ciegas.

const BUILD_RE = /\b(npm run build|npm run test|npm test|vite build|next build|tsc\b|yarn build|pnpm build|astro build|cargo build|go build)\b/;

let buf = '';
process.stdin.setEncoding('utf8');
process.stdin.on('data', (c) => { buf += c; });
process.stdin.on('end', () => {
  try {
    const input = JSON.parse(buf);
    const cmd = (input && input.tool_input && input.tool_input.command) || '';
    if (BUILD_RE.test(cmd)) {
      process.stdout.write(JSON.stringify({
        hookSpecificOutput: {
          hookEventName: 'PostToolUseFailure',
          additionalContext: 'El Coro: falló un build/test. Lee el error COMPLETO e identifica la causa raíz (no el síntoma). Para cascadas de errores: /el-coro:build-fix o el agente el-coro:build-resolver. Tras 3 intentos fallidos: PARAR e instrumentar antes del próximo intento.',
        },
      }));
    }
  } catch (_) {}
  process.exit(0);
});
