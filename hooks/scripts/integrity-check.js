#!/usr/bin/env node
'use strict';

// SessionStart — corre la validación estructural del plugin (skills mal
// anidadas, frontmatter roto, colisiones, hooks.json apuntando a nada,
// referencias muertas, npm/npx prohibido) y deja el reporte en
// <STATE_ROOT>/state/integrity.json para que load-context.js lo muestre.
//
// Nace de un incidente real: 85 skills estuvieron invisibles durante meses
// (mal anidadas un nivel de más bajo skills/) sin que nada lo detectara —
// el integrity-check viejo solo miraba name/model/description de agentes.
// Esto no puede volver a fallar en silencio: si hay problemas CRÍTICOS,
// además de quedar en el JSON se imprimen por stderr para que se vean sí o
// sí en la sesión donde ocurren.
//
// Camino síncrono, rápido (<300ms) y SIEMPRE falla abierto: cualquier
// excepción interna (incluida la ausencia de ./lib/guard, que puede no
// existir todavía si esa lib compartida se despliega en otro momento)
// termina en process.exit(0) sin bloquear la sesión ni ensuciar stdout.

let guard = null;
try {
  // lib/guard.js es infraestructura compartida entre hooks (wrapper
  // fail-open común). Si todavía no existe en el repo, seguimos sin ella:
  // este archivo ya implementa su propio fail-open completo más abajo.
  guard = require('./lib/guard');
} catch (_) {
  guard = null;
}

function run() {
  const fs = require('fs');
  const path = require('path');

  const PLUGIN_ROOT = process.env.CLAUDE_PLUGIN_ROOT || path.resolve(__dirname, '..', '..');
  const { validatePlugin } = require('./lib/plugin-validate');
  const { STATE_ROOT, ensureDir } = require('./lib/state-dir');

  const result = validatePlugin(PLUGIN_ROOT);

  const counts = { critico: 0, alto: 0, medio: 0 };
  for (const p of result.problemas) {
    if (Object.prototype.hasOwnProperty.call(counts, p.severidad)) counts[p.severidad]++;
  }

  const report = {
    timestamp: new Date().toISOString(),
    ok: result.ok,
    counts,
    total: result.problemas.length,
    problemas: result.problemas,
  };

  try {
    const stateDir = path.join(STATE_ROOT, 'state');
    ensureDir(stateDir);
    const reportPath = path.join(stateDir, 'integrity.json');
    const tmp = reportPath + '.tmp';
    fs.writeFileSync(tmp, JSON.stringify(report, null, 2));
    fs.renameSync(tmp, reportPath);
  } catch (_) {
    // Si no se pudo escribir el reporte, seguimos igual — lo que importa
    // primero es no bloquear la sesión y, segundo, gritar por stderr si hay
    // algo crítico (eso pasa abajo independientemente de si el write funcionó).
  }

  const criticos = result.problemas.filter((p) => p.severidad === 'critico');
  if (criticos.length > 0) {
    const lines = criticos.map((p) => `  [CRITICO] ${p.que}\n            en: ${p.donde}`);
    process.stderr.write(
      `[integrity-check] ${criticos.length} problema(s) CRITICO(s) en El Coro — revisar ${path.join('state', 'integrity.json')}:\n` +
        lines.join('\n') +
        '\n'
    );
  }
}

function main() {
  try {
    if (guard && typeof guard.run === 'function') {
      guard.run(run);
    } else {
      run();
    }
  } catch (_) {
    // Fallar abierto siempre: un problema de integridad del plugin nunca
    // puede convertirse en un problema de "la sesión no arranca".
  }
  process.exit(0);
}

main();
