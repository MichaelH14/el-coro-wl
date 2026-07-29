'use strict';

// Detección de package manager por lockfile — evita invocar npm/npx desde los
// hooks. Compartida por type-check.js, lint-check.js y qa-gate-task.js.

const fs = require('fs');
const path = require('path');

// Orden importa: si hay más de un lockfile (repo migrando), gana el primero.
// npm queda deliberadamente fuera: nada de npm/npx en estos hooks, ni
// siquiera como respaldo para proyectos con package-lock.json — en ese caso
// detectPkgManager devuelve null y el caller no corre nada.
const LOCKFILE_MAP = [
  ['pnpm-lock.yaml', 'pnpm'],
  ['yarn.lock', 'yarn'],
  ['bun.lockb', 'bun'],
  ['bun.lock', 'bun'],
];

function detectPkgManager(dir) {
  for (const [lockfile, mgr] of LOCKFILE_MAP) {
    try {
      if (fs.existsSync(path.join(dir, lockfile))) return mgr;
    } catch (_) {
      // ignorar y seguir probando
    }
  }
  return null;
}

// Ruta al binario local en node_modules/.bin — funciona sin importar qué
// package manager lo instaló.
function localBinPath(projectRoot, binName) {
  return path.join(projectRoot, 'node_modules', '.bin', binName);
}

// {cmd, args} para correr un binario ya instalado (eslint, tsc) a través del
// package manager detectado, SIN dejar que auto-instale un paquete homónimo
// desde el registro (por eso nunca usamos "npx <bin>" a secas, y nunca npm).
function execArgsForBin(pm, binName, extraArgs) {
  extraArgs = extraArgs || [];
  switch (pm) {
    case 'pnpm':
      return { cmd: 'pnpm', args: ['exec', binName, ...extraArgs] };
    case 'yarn':
      return { cmd: 'yarn', args: [binName, ...extraArgs] };
    case 'bun':
      return { cmd: 'bun', args: ['run', binName, ...extraArgs] };
    default:
      return null;
  }
}

// {cmd, args} para correr un script declarado en package.json (scripts.build, etc).
function execArgsForScript(pm, scriptName) {
  switch (pm) {
    case 'pnpm':
      return { cmd: 'pnpm', args: ['run', scriptName] };
    case 'yarn':
      return { cmd: 'yarn', args: ['run', scriptName] };
    case 'bun':
      return { cmd: 'bun', args: ['run', scriptName] };
    default:
      return null;
  }
}

module.exports = { detectPkgManager, localBinPath, execArgsForBin, execArgsForScript };
