#!/usr/bin/env node
'use strict';

// Blindaje anti-recursion: si corremos dentro de una sesion de aprendizaje, salir ya.
require('./lib/guard');

const { execFileSync } = require('child_process');
const path = require('path');
const fs = require('fs');
const { detectPkgManager, localBinPath, execArgsForBin } = require('./lib/pkg-manager');

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
    if (fs.existsSync(path.join(dir, 'package.json'))) {
      return dir;
    }
    dir = path.dirname(dir);
  }
  return null;
}

// Igual que type-check.js: nunca "npx eslint" a secas (auto-instala un
// paquete homónimo si no hay eslint real en el proyecto).
function resolveEslintCommand(projectRoot) {
  const binPath = localBinPath(projectRoot, 'eslint');
  if (fs.existsSync(binPath)) {
    return { cmd: binPath };
  }
  const pm = detectPkgManager(projectRoot);
  const viaPm = pm ? execArgsForBin(pm, 'eslint') : null;
  return viaPm ? { cmd: viaPm.cmd, baseArgs: viaPm.args } : null;
}

async function main() {
  try {
    const input = await readStdin();
    if (!input || !input.tool_input || !input.tool_input.file_path) {
      process.exit(0);
      return;
    }

    const filePath = input.tool_input.file_path;

    // Only lint JS/TS files
    const ext = path.extname(filePath);
    if (!['.js', '.jsx', '.ts', '.tsx', '.mjs', '.cjs'].includes(ext)) {
      process.exit(0);
      return;
    }

    // File must exist
    if (!fs.existsSync(filePath)) {
      process.exit(0);
      return;
    }

    const projectRoot = findProjectRoot(filePath);
    if (!projectRoot) {
      process.exit(0);
      return;
    }

    const command = resolveEslintCommand(projectRoot);
    if (!command) {
      // No hay ESLint instalado (ni binario local ni package manager que lo
      // resuelva) — no hay nada real que lintear. Silencio, no falso "limpio".
      process.exit(0);
      return;
    }

    const args = [...(command.baseArgs || []), '--no-error-on-unmatched-pattern', filePath];

    try {
      const output = execFileSync(command.cmd, args, {
        cwd: projectRoot,
        encoding: 'utf8',
        timeout: 12000,
        stdio: 'pipe',
      });
      if (output.trim()) {
        process.stderr.write(`[lint-check] ${output}\n`);
      }
    } catch (err) {
      const stdout = (err.stdout || '').trim();
      const stderr = (err.stderr || '').trim();
      if (stdout) {
        // ESLint corrió y encontró problemas — reporte normal.
        process.stderr.write(`[lint-check] Errores de lint:\n${stdout}\n`);
      } else if (stderr) {
        // ESLint NO llegó a lintear nada (config faltante/rota, crash, etc.)
        // — esto NO es "código limpio", es que el check no corrió.
        process.stderr.write(`[lint-check] ESLint NO corrió (config faltante o rota):\n${stderr}\n`);
      } else {
        process.stderr.write(`[lint-check] ESLint NO corrió: ${err.message || 'sin detalle'}\n`);
      }
    }
  } catch (_) {
    // Graceful degradation — async hook, never block
  }

  process.exit(0);
}

main();
