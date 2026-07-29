'use strict';

// Suite de regresion de hooks para El Coro WL.
// node puro: node:test + node:assert. Sin dependencias externas, sin red,
// sin tocar el VPS ni ~/.el-coro real (todo corre bajo un tmpdir propio via
// EL_CORO_STATE_DIR / HOME, que se borra al final).
//
// Correr: node --test tests/  (o el script "test" de package.json)
//
// Adaptado del repo personal: el pipeline de aprendizaje (session-learn.js,
// learn-distill.js, coro-mode.js, prompt-router.js) todavia no existe en
// este repo — se rediseña aparte, no se propaga en esta pasada. Los casos
// que probaban esos hooks quedan afuera; cortex-learn.js (el equivalente
// mas simple que SI existe aca) tiene su propio caso de smoke.

import { test, before, after, describe } from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import net from 'node:net';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const REPO_ROOT = path.resolve(__dirname, '..');
const SCRIPTS_DIR = path.join(REPO_ROOT, 'hooks', 'scripts');
const AGENTS_DIR = path.join(REPO_ROOT, 'agents');
const COMMANDS_DIR = path.join(REPO_ROOT, 'commands');
const SKILLS_DIR = path.join(REPO_ROOT, 'skills');
const HOOKS_JSON_PATH = path.join(REPO_ROOT, 'hooks', 'hooks.json');

// ---------------------------------------------------------------------------
// tmp sandbox: todo lo que los hooks puedan escribir (STATE_ROOT, HOME) vive
// aca. Se crea antes de correr y se borra al final, pase lo que pase.
// ---------------------------------------------------------------------------

let TMP_ROOT;
let STATE_DIR;
let HOME_DIR;
let WORK_DIR;

before(() => {
  TMP_ROOT = fs.mkdtempSync(path.join(os.tmpdir(), 'el-coro-wl-hooks-test-'));
  STATE_DIR = path.join(TMP_ROOT, 'state-root');
  HOME_DIR = path.join(TMP_ROOT, 'home');
  WORK_DIR = path.join(TMP_ROOT, 'work');
  fs.mkdirSync(STATE_DIR, { recursive: true });
  fs.mkdirSync(path.join(HOME_DIR, '.claude'), { recursive: true });
  fs.mkdirSync(WORK_DIR, { recursive: true });
});

after(() => {
  if (TMP_ROOT && fs.existsSync(TMP_ROOT)) {
    fs.rmSync(TMP_ROOT, { recursive: true, force: true });
  }
});

function baseEnv() {
  return {
    ...process.env,
    EL_CORO_STATE_DIR: STATE_DIR,
    HOME: HOME_DIR,
    CLAUDE_PLUGIN_ROOT: REPO_ROOT,
    // Nunca queremos que un hook de prueba intente hablar con un VPS real
    // aunque algun bug futuro reactive sync-to-vps.js sin querer.
    EL_CORO_VPS_HOST: '127.0.0.1',
  };
}

/**
 * Corre un script de hooks/scripts/<name> con el payload dado por stdin.
 * @param {string} scriptName - ej "port-check.js"
 * @param {string|object|undefined} input - objeto (se serializa a JSON), string cruda, o undefined (stdin vacio)
 * @param {object} [envOverrides]
 */
function runHook(scriptName, input, envOverrides = {}) {
  const scriptPath = path.join(SCRIPTS_DIR, scriptName);
  const stdin = input === undefined ? '' : (typeof input === 'string' ? input : JSON.stringify(input));
  const isShell = scriptName.endsWith('.sh');
  const res = isShell
    ? spawnSync('bash', [scriptPath], {
        input: stdin,
        encoding: 'utf8',
        timeout: 10000,
        cwd: envOverrides.cwd || WORK_DIR,
        env: { ...baseEnv(), ...envOverrides },
      })
    : spawnSync(process.execPath, [scriptPath], {
        input: stdin,
        encoding: 'utf8',
        timeout: 10000,
        cwd: envOverrides.cwd || WORK_DIR,
        env: { ...baseEnv(), ...envOverrides },
      });
  return res;
}

// Marcadores de que el proceso reventó con una excepción no controlada en
// vez de fallar-abierto de forma controlada (ReferenceError, module not
// found, etc.) — un hook bien escrito nunca deja escapar esto.
const CRASH_MARKERS = [
  /ReferenceError/,
  /TypeError:\s/,
  /Cannot find module/,
  /is not defined/,
  /is not a function/,
  /SyntaxError/,
  /UnhandledPromiseRejection/,
  /throw err;/,
  /Node\.js v\d/,
  /\n\s+at .+\(.*:\d+:\d+\)/, // stack trace frame tipico de node
];

function assertNoCrash(res, label) {
  assert.strictEqual(res.error, undefined, `${label}: fallo al lanzar el proceso: ${res.error}`);
  assert.notStrictEqual(res.status, null, `${label}: el proceso murio por señal ${res.signal} (timeout/crash), stderr:\n${res.stderr}`);
  for (const marker of CRASH_MARKERS) {
    assert.ok(
      !marker.test(res.stderr || ''),
      `${label}: stderr parece un crash (matchea ${marker}):\n${res.stderr}`
    );
  }
}

// ---------------------------------------------------------------------------
// A) SMOKE — cada uno de los 24 scripts de hooks/scripts/*.js recibe el
// payload del evento que le corresponde segun hooks.json y no debe crashear.
// Los payloads son deliberadamente benignos (no gatillan bloqueo) para que
// la unica pregunta sea "sobrevive o no" — la regresion de bloqueo real va
// en la seccion B.
// ---------------------------------------------------------------------------

describe('A) smoke — los 24 hooks/scripts/*.js no crashean', () => {
  const benignBashPayload = { tool_name: 'Bash', tool_input: { command: 'ls -la' }, cwd: WORK_DIR };
  const tsFile = path.join(WORK_DIR, 'smoke.ts');
  const jsFile = path.join(WORK_DIR, 'smoke.js');
  fs.writeFileSync(jsFile, 'const x = 1;\nconsole.log(x);\n');

  const SMOKE_CASES = [
    // SessionStart — no leen stdin, pero deben tolerar cualquier cosa
    ['load-context.js', {}],
    ['integrity-check.js', {}],
    // PostCompact
    ['post-compact.js', {}],
    // UserPromptSubmit
    ['sombra-user-message.js', { prompt: 'hola, prueba de humo' }],
    // PreToolUse Bash (guardianes) — comando benigno, sin rsync/no-verify/puerto
    ['deploy-guard.js', benignBashPayload],
    ['port-check.js', benignBashPayload],
    ['block-no-verify.js', benignBashPayload],
    // PreToolUse Write|Edit
    ['secret-scan.js', { tool_name: 'Write', tool_input: { file_path: path.join(WORK_DIR, 'x.txt'), content: 'contenido sin secretos' } }],
    ['completion-check.js', { tool_name: 'Write', tool_input: { file_path: path.join(WORK_DIR, 'routes', 'x.ts'), content: 'export const x = 1;' } }],
    // PostToolUse Bash
    ['post-deploy-health.js', benignBashPayload],
    // PostToolUse *
    ['progress-track.js', { tool_name: 'Bash', tool_input: { command: 'ls' } }],
    ['sombra-observe.js', { tool_name: 'Read', tool_input: { file_path: jsFile } }],
    // PostToolUse Write|Edit
    ['type-check.js', { tool_input: { file_path: tsFile } }],
    ['lint-check.js', { tool_input: { file_path: jsFile } }],
    ['console-log-warn.js', { tool_input: { file_path: path.join(WORK_DIR, 'Component.tsx'), new_string: 'console.log("debug")' } }],
    ['cortex-learn.js', { tool_name: 'Write', tool_input: { file_path: jsFile, content: 'const x = 1;\nconsole.log(x);\n' } }],
    // PostToolUseFailure Bash
    ['build-failure-hint.js', { tool_input: { command: 'pnpm build' } }],
    // Stop
    ['session-summary.js', {}],
    ['prediction-validate.js', {}],
    ['sync-to-vps.js', {}], // sin VPS configurado (env limpio) — debe salir SKIP, no tocar red
    // TaskCompleted
    ['qa-gate-task.js', { files_changed: [] }],
    ['sombra-task-done.js', { status: 'completed', name: 'smoke task' }],
    // TaskCreated
    ['sombra-task-created.js', { type: 'feature', name: 'smoke task' }],
    // TeammateIdle
    ['qa-gate-idle.js', { assigned_tasks: [{ name: 't1', status: 'completed' }] }],
  ];

  // Todos los .js que existen en disco deben estar cubiertos arriba —
  // si alguien agrega un script nuevo y se olvida de este archivo, el test
  // grita en vez de dejarlo sin cubrir en silencio.
  test('cobertura: todos los .js de hooks/scripts/ tienen caso de smoke', () => {
    const onDisk = fs.readdirSync(SCRIPTS_DIR).filter((f) => f.endsWith('.js')).sort();
    const covered = SMOKE_CASES.map(([name]) => name).sort();
    assert.deepStrictEqual(covered, onDisk, 'hay scripts .js sin caso de smoke (o casos de scripts que ya no existen)');
  });

  for (const [name, payload] of SMOKE_CASES) {
    test(`smoke: ${name}`, () => {
      const res = runHook(name, payload);
      assertNoCrash(res, name);
      assert.strictEqual(res.status, 0, `${name}: exit code esperado 0, dio ${res.status}\nstdout: ${res.stdout}\nstderr: ${res.stderr}`);
    });
  }
});

// ---------------------------------------------------------------------------
// B) REGRESION de los 3 guardianes — casos benignos que NO deben bloquear y
// casos reales que SI deben bloquear/avisar.
// ---------------------------------------------------------------------------

describe('B) regresion — guardianes', () => {
  describe('port-check.js', () => {
    const benign = [
      ['curl a servicio local', 'curl http://localhost:3025/health'],
      ['psql -p', 'psql -p 5432 -h localhost -U postgres'],
      ['redis-cli -p', 'redis-cli -p 6399 ping'],
      ['comando con URL https', 'curl https://example.com:8443/status'],
      ['docker ps', 'docker ps'],
    ];
    for (const [label, cmd] of benign) {
      test(`NO bloquea: ${label}`, () => {
        const res = runHook('port-check.js', { tool_input: { command: cmd } });
        assertNoCrash(res, 'port-check.js');
        assert.strictEqual(res.status, 0, `deberia pasar sin bloquear: "${cmd}"\nstderr: ${res.stderr}`);
      });
    }

    test('SI avisa: bind real a un puerto ya ocupado', async () => {
      // Ocupamos un puerto efimero real y le pedimos a port-check que
      // chequee un comando que intenta bindear justo ese puerto.
      const server = net.createServer();
      const port = await new Promise((resolve, reject) => {
        server.once('error', reject);
        server.listen(0, '127.0.0.1', () => resolve(server.address().port));
      });
      try {
        const res = runHook('port-check.js', { tool_input: { command: `next dev -p ${port}` } });
        assertNoCrash(res, 'port-check.js');
        assert.strictEqual(res.status, 2, `deberia bloquear un bind a puerto ${port} ya ocupado\nstderr: ${res.stderr}`);
        assert.match(res.stderr, /BLOQUEADO/);
        assert.match(res.stderr, new RegExp(String(port)));
      } finally {
        await new Promise((resolve) => server.close(resolve));
      }
    });
  });

  describe('deploy-guard.js', () => {
    test('bloquea rsync directo a un host remoto', () => {
      // 192.0.2.0/24 es rango reservado para documentacion (RFC 5737) — no
      // es una IP real de nadie, solo dispara el patron "rsync a una IP".
      const res = runHook('deploy-guard.js', {
        tool_input: { command: 'rsync -avz ./dist/ deploy@192.0.2.10:/var/www/' },
      });
      assertNoCrash(res, 'deploy-guard.js');
      assert.strictEqual(res.status, 2, `stderr: ${res.stderr}`);
      assert.match(res.stderr, /BLOQUEADO/);
    });

    test('NO bloquea: mencion textual de rsync/vps en un echo', () => {
      const res = runHook('deploy-guard.js', {
        tool_input: { command: 'echo "esto menciona rsync al vps"' },
      });
      assertNoCrash(res, 'deploy-guard.js');
      assert.strictEqual(res.status, 0, `stderr: ${res.stderr}`);
    });

    test('NO bloquea: nombre de archivo que contiene "rsync-vps"', () => {
      const res = runHook('deploy-guard.js', {
        tool_input: { command: 'mv payload-rsync-vps.json /tmp/' },
      });
      assertNoCrash(res, 'deploy-guard.js');
      assert.strictEqual(res.status, 0, `stderr: ${res.stderr}`);
    });
  });

  describe('block-no-verify.js', () => {
    test('bloquea git commit --no-verify', () => {
      const res = runHook('block-no-verify.js', { tool_input: { command: 'git commit --no-verify -m "x"' } });
      assertNoCrash(res, 'block-no-verify.js');
      assert.strictEqual(res.status, 2, `stderr: ${res.stderr}`);
      assert.match(res.stderr, /BLOQUEADO/);
    });

    test('NO bloquea: grep buscando el string --no-verify', () => {
      const res = runHook('block-no-verify.js', { tool_input: { command: 'grep -rn -- "--no-verify" docs/' } });
      assertNoCrash(res, 'block-no-verify.js');
      assert.strictEqual(res.status, 0, `stderr: ${res.stderr}`);
    });

    // Regresion real: el hook bloqueo un echo que llevaba el comando git dentro
    // de un payload JSON. Solo cuenta si el comando REALMENTE ejecutado es git.
    test('NO bloquea: git commit --no-verify citado dentro de un echo/JSON', () => {
      const cmd = `echo '{"command":"git commit --no-verify -m x"}'`;
      const res = runHook('block-no-verify.js', { tool_input: { command: cmd } });
      assertNoCrash(res, 'block-no-verify.js');
      assert.strictEqual(res.status, 0, `stderr: ${res.stderr}`);
    });

    test('NO bloquea: frase explicativa que nombra el flag', () => {
      const res = runHook('block-no-verify.js', { tool_input: { command: 'echo "no uses git commit --no-verify nunca"' } });
      assertNoCrash(res, 'block-no-verify.js');
      assert.strictEqual(res.status, 0, `stderr: ${res.stderr}`);
    });

    test('bloquea tambien git push --no-verify', () => {
      const res = runHook('block-no-verify.js', { tool_input: { command: 'git push --no-verify' } });
      assertNoCrash(res, 'block-no-verify.js');
      assert.strictEqual(res.status, 2, `stderr: ${res.stderr}`);
    });
  });
});

// ---------------------------------------------------------------------------
// C) FAIL-OPEN — a cada hook de PreToolUse (los que pueden bloquear una
// herramienta) le mandamos stdin invalido y comprobamos que sale 0 y no
// bloquea. Un guardian que explota con basura rompe el entorno de TODOS.
// ---------------------------------------------------------------------------

describe('C) fail-open — stdin invalido nunca bloquea', () => {
  const PRE_TOOL_USE_HOOKS = [
    'deploy-guard.js',
    'port-check.js',
    'block-no-verify.js',
    'secret-scan.js',
    'completion-check.js',
  ];

  const GARBAGE_CASES = [
    ['JSON roto', '{ esto no es json valido'],
    ['stdin vacio', ''],
    ['JSON valido pero vacio', '{}'],
    ['tool_input null', JSON.stringify({ tool_input: null })],
    ['tool_input sin command/file_path', JSON.stringify({ tool_input: {} })],
    ['command no es string', JSON.stringify({ tool_input: { command: 12345 } })],
    ['array en vez de objeto', '[1,2,3]'],
    ['solo un string JSON', '"hola"'],
    ['null literal', 'null'],
  ];

  for (const hookName of PRE_TOOL_USE_HOOKS) {
    describe(hookName, () => {
      for (const [label, garbage] of GARBAGE_CASES) {
        test(`fail-open: ${label}`, () => {
          const res = runHook(hookName, garbage);
          assertNoCrash(res, hookName);
          assert.strictEqual(res.status, 0, `${hookName} con "${label}" deberia salir 0 (fail-open), dio ${res.status}\nstderr: ${res.stderr}`);
        });
      }
    });
  }
});

// ---------------------------------------------------------------------------
// D) INTEGRIDAD del plugin
// ---------------------------------------------------------------------------

describe('D) integridad del plugin', () => {
  test('hooks.json es JSON valido', () => {
    const raw = fs.readFileSync(HOOKS_JSON_PATH, 'utf8');
    assert.doesNotThrow(() => JSON.parse(raw));
  });

  test('todo comando referenciado en hooks.json existe en disco', () => {
    const raw = fs.readFileSync(HOOKS_JSON_PATH, 'utf8');
    const hooksConfig = JSON.parse(raw);

    // Recorre hooks.* y hooks._disabled.* buscando entradas {type:"command", command:"..."}
    const commands = [];
    function walk(node) {
      if (Array.isArray(node)) {
        node.forEach(walk);
      } else if (node && typeof node === 'object') {
        if (node.type === 'command' && typeof node.command === 'string') {
          commands.push(node.command);
        }
        for (const v of Object.values(node)) walk(v);
      }
    }
    walk(hooksConfig.hooks);
    walk(hooksConfig._disabled);

    assert.ok(commands.length > 0, 'no se encontro ningun comando en hooks.json — el parser puede estar roto');

    const missing = [];
    for (const cmdLine of commands) {
      const resolved = cmdLine.replace(/\$\{CLAUDE_PLUGIN_ROOT\}/g, REPO_ROOT);
      // Extrae la ruta de archivo: quita "node "/"bash " del inicio y comillas
      const match = resolved.match(/(?:node|bash)\s+"?([^"]+\.(?:js|sh))"?/);
      if (!match) {
        missing.push(`no se pudo extraer ruta de: ${cmdLine}`);
        continue;
      }
      const scriptPath = match[1];
      if (!fs.existsSync(scriptPath)) {
        missing.push(`${cmdLine} -> ${scriptPath} NO EXISTE`);
      }
    }
    assert.deepStrictEqual(missing, [], `comandos de hooks.json apuntando a archivos inexistentes:\n${missing.join('\n')}`);
  });

  test('los agents/*.md tienen frontmatter con name+description', () => {
    const files = fs.readdirSync(AGENTS_DIR).filter((f) => f.endsWith('.md'));
    assert.ok(files.length > 0, 'no se encontro ningun agente');

    const problems = [];
    for (const file of files) {
      const content = fs.readFileSync(path.join(AGENTS_DIR, file), 'utf8');
      if (!content.startsWith('---')) {
        problems.push(`${file}: no empieza con frontmatter ---`);
        continue;
      }
      const end = content.indexOf('---', 3);
      if (end === -1) {
        problems.push(`${file}: frontmatter sin cerrar`);
        continue;
      }
      const frontmatter = content.slice(3, end);
      const lines = frontmatter.split('\n').map((l) => l.trim());
      const hasField = (field) => lines.some((l) => l.startsWith(`${field}:`));
      if (!hasField('name')) problems.push(`${file}: falta 'name'`);
      if (!hasField('description')) problems.push(`${file}: falta 'description'`);
    }
    assert.deepStrictEqual(problems, [], problems.join('\n'));
  });

  // 'memory: true' invalido (deberia ser user|project|local) es deuda de
  // higiene PRE-EXISTENTE, no propagada en esta pasada (fuera del alcance:
  // flatten de skills + guardianes + hooks honestos + tests). Este test NO
  // pretende que esta arreglado — solo evita que crezca en silencio.
  test('memory: true invalido no crece mas alla del baseline conocido', () => {
    const files = fs.readdirSync(AGENTS_DIR).filter((f) => f.endsWith('.md'));
    const offenders = [];
    for (const file of files) {
      const content = fs.readFileSync(path.join(AGENTS_DIR, file), 'utf8');
      if (/^\s*memory:\s*true\s*$/m.test(content)) offenders.push(file);
    }
    const KNOWN_BASELINE = 5;
    assert.ok(
      offenders.length <= KNOWN_BASELINE,
      `crecio la cantidad de agentes con 'memory: true' invalido (baseline conocido ${KNOWN_BASELINE}): ${offenders.join(', ')}`
    );
  });

  // 'arguments:' (deberia ser 'argument-hint:') — misma deuda pre-existente
  // que 'memory: true', fuera del alcance de esta pasada. Regresion, no fix.
  test("'arguments:' en commands/*.md no crece mas alla del baseline conocido", () => {
    const files = fs.readdirSync(COMMANDS_DIR).filter((f) => f.endsWith('.md'));
    assert.ok(files.length > 0, 'no se encontro ningun comando');

    const offenders = [];
    for (const file of files) {
      const content = fs.readFileSync(path.join(COMMANDS_DIR, file), 'utf8');
      if (/^arguments:/m.test(content)) offenders.push(file);
    }
    const KNOWN_BASELINE = 41;
    assert.ok(
      offenders.length <= KNOWN_BASELINE,
      `crecio la cantidad de comandos con 'arguments:' (baseline conocido ${KNOWN_BASELINE}): ${offenders.join(', ')}`
    );
  });

  test('cada skills/*/SKILL.md esta a exactamente un nivel bajo skills/, con name+description', () => {
    const skillMdFiles = [];
    function walk(dir) {
      for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
        const full = path.join(dir, entry.name);
        if (entry.isDirectory()) walk(full);
        else if (entry.isFile() && entry.name === 'SKILL.md') skillMdFiles.push(full);
      }
    }
    walk(SKILLS_DIR);

    assert.ok(skillMdFiles.length > 0, 'no se encontro ningun SKILL.md bajo skills/');

    const wrongDepth = [];
    const missingFrontmatter = [];
    for (const full of skillMdFiles) {
      const rel = path.relative(SKILLS_DIR, full); // debe ser "<nombre>/SKILL.md"
      const parts = rel.split(path.sep);
      if (parts.length !== 2 || parts[1] !== 'SKILL.md') {
        wrongDepth.push(rel);
        continue;
      }
      const content = fs.readFileSync(full, 'utf8');
      if (!content.startsWith('---')) { missingFrontmatter.push(`${rel}: sin frontmatter`); continue; }
      const end = content.indexOf('---', 3);
      if (end === -1) { missingFrontmatter.push(`${rel}: frontmatter sin cerrar`); continue; }
      const frontmatter = content.slice(3, end);
      const lines = frontmatter.split('\n').map((l) => l.trim());
      const hasField = (field) => lines.some((l) => l.startsWith(`${field}:`));
      if (!hasField('name')) missingFrontmatter.push(`${rel}: falta 'name'`);
      if (!hasField('description')) missingFrontmatter.push(`${rel}: falta 'description'`);
    }

    assert.deepStrictEqual(wrongDepth, [], `SKILL.md a una profundidad incorrecta (deben vivir en skills/<nombre>/SKILL.md):\n${wrongDepth.join('\n')}`);
    assert.deepStrictEqual(missingFrontmatter, [], missingFrontmatter.join('\n'));
  });
});
