#!/usr/bin/env node
'use strict';

// Blindaje anti-recursion: si corremos dentro de una sesion de aprendizaje, salir ya.
require('./lib/guard');

// Block direct rsync to any remote host — always use deploy.sh
const VPS_PATTERNS = [
  /rsync\b.*\b(?:\d{1,3}\.){3}\d{1,3}:/,   // rsync to any IP with colon (scp-style)
  /rsync\b.*@.*:/,                            // rsync user@host:
  /rsync\b.*\b(vps|server|remote)\b/i,       // rsync with known hostnames
  /rsync\b.*prod/i,                           // rsync to anything with "prod"
];

function splitSegments(cmd) {
  return cmd.split(/&&|\|\||[;|]/);
}

function firstCommandToken(segment) {
  const tokens = segment.trim().split(/\s+/).filter(Boolean);
  let i = 0;
  // saltar asignaciones de env var al inicio (FOO=bar comando ...)
  while (i < tokens.length && /^[A-Za-z_][A-Za-z0-9_]*=/.test(tokens[i])) i++;
  const tok = tokens[i];
  if (!tok) return null;
  return tok.split('/').pop();
}

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

    // Only check commands that contain rsync
    if (!cmd.includes('rsync')) {
      process.exit(0);
      return;
    }

    // Exigir que 'rsync' sea el primer token real de algun segmento del
    // comando (separado por ; && || |), no solo un substring en cualquier
    // parte (ej. un comentario, o un nombre de archivo como payload-rsync-vps.json).
    for (const segment of splitSegments(cmd)) {
      if (firstCommandToken(segment) !== 'rsync') continue;

      for (const pattern of VPS_PATTERNS) {
        if (pattern.test(segment)) {
          process.stderr.write('BLOQUEADO: No rsync directo al VPS. Usa deploy.sh');
          process.exit(2);
          return;
        }
      }
    }
  } catch (_) {
    // Graceful degradation — don't block on hook failure
  }

  process.exit(0);
}

main();
