#!/usr/bin/env node
'use strict';

// Blindaje anti-recursion: si corremos dentro de una sesion de aprendizaje, salir ya.
require('./lib/guard');

// Solo cuenta si el comando REALMENTE ejecutado es git. Una mencion de
// "git commit --no-verify" dentro de un echo, un grep o un payload JSON
// no es un intento de saltarse los hooks.
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

function usaNoVerifyEnGitReal(cmd) {
  if (!cmd.includes('--no-verify')) return false;
  return splitSegments(cmd).some(seg =>
    firstCommandToken(seg) === 'git' && /--no-verify\b/.test(seg)
  );
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

    if (usaNoVerifyEnGitReal(cmd)) {
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
