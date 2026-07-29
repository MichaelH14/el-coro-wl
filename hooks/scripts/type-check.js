#!/usr/bin/env node
'use strict';

// Blindaje anti-recursion: si corremos dentro de una sesion de aprendizaje, salir ya.
require('./lib/guard');

const { execFileSync } = require('child_process');
const path = require('path');
const fs = require('fs');
const { detectPkgManager, localBinPath, execArgsForBin } = require('./lib/pkg-manager');

const TYPE_ERROR_PATTERN = /error TS\d+/;
// tsc --pretty mete códigos ANSI entre "error" y "TSxxxx" — sin esto el
// patrón nunca matchea y un error de tipo real se reporta como "no pudo correr".
// eslint-disable-next-line no-control-regex
const ANSI_PATTERN = /\x1b\[[0-9;]*m/g;

function stripAnsi(str) {
  return str.replace(ANSI_PATTERN, '');
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

function findProjectRoot(filePath) {
  let dir = path.dirname(filePath);
  while (dir !== path.dirname(dir)) {
    if (fs.existsSync(path.join(dir, 'tsconfig.json'))) {
      return dir;
    }
    dir = path.dirname(dir);
  }
  return null;
}

// Decide cómo (y si) invocar tsc real, sin caer nunca en "npx tsc" a secas
// (que si no hay TypeScript instalado baja/ejecuta un paquete homónimo).
function resolveTscCommand(projectRoot) {
  const binPath = localBinPath(projectRoot, 'tsc');
  if (fs.existsSync(binPath)) {
    return { cmd: binPath, args: ['--noEmit', '--pretty'] };
  }
  // No hay binario local directo (ej. monorepo con node_modules hoisteado al
  // root del workspace) — probar vía el package manager real del proyecto,
  // que resuelve local sin auto-instalar como hace npx.
  const pm = detectPkgManager(projectRoot);
  const viaPm = pm ? execArgsForBin(pm, 'tsc', ['--noEmit', '--pretty']) : null;
  return viaPm ? { cmd: viaPm.cmd, args: viaPm.args } : null;
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

    const command = resolveTscCommand(projectRoot);
    if (!command) {
      // No hay tsc instalado (ni binario local ni package manager que lo
      // resuelva) — no hay nada real que chequear. Salir en silencio, sin
      // reportar "errores de tipo" que en realidad son ruido de npx.
      process.exit(0);
      return;
    }

    try {
      execFileSync(command.cmd, command.args, {
        cwd: projectRoot,
        encoding: 'utf8',
        timeout: 25000,
        stdio: 'pipe',
      });
    } catch (err) {
      const output = `${err.stdout || ''}${err.stderr || ''}`;
      if (TYPE_ERROR_PATTERN.test(stripAnsi(output))) {
        process.stderr.write(`[type-check] Errores de tipo detectados:\n${output}\n`);
      } else {
        // tsc no corrió de verdad (crash, falta el binario en runtime, etc.) —
        // no es lo mismo que "hay errores de tipo".
        const detail = output.trim() || err.message || 'sin detalle';
        process.stderr.write(`[type-check] tsc no pudo correr (no se reportan errores de tipo):\n${detail}\n`);
      }
    }
  } catch (_) {
    // Graceful degradation — async hook, never block
  }

  process.exit(0);
}

main();
