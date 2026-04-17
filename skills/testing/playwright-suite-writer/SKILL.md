---
name: playwright-suite-writer
description: Scaffolds a complete Playwright E2E suite (config + fixtures + global setup/teardown + test-reset endpoint + example specs + findings template) for a project. Use when the user wants to add E2E tests and the project does not yet have Playwright, NOT for documentation questions about E2E testing (use `e2e-testing` skill for that).
---

# Playwright Suite Writer

Generates production-grade E2E scaffolding for a project. Every output has hard guards against hitting production, deterministic fixtures, and a single-worker config that survives real-world quirks (Socket.io transport upgrades, DB crash-recovery rehydration, pointer-events on overlapping elements, CSS `opacity`-only overlays).

## Preconditions

- Project has a `package.json` and an HTTP server startable with `npm start` (or equivalent)
- `node` 18+
- Project uses a database the suite can connect to AND TRUNCATE (Postgres/MySQL/SQLite). If the project is stateless or uses a fully-mocked store, skip the DB steps.
- Project has not yet installed `@playwright/test` (if it has, confirm with user before overwriting)

## Inputs the skill must collect before writing

Ask the user (or infer from the repo) before scaffolding:

1. **Project root path** — absolute path
2. **App stack** — Express / Koa / Fastify / Next.js / custom (affects how the server is spawned in globalSetup)
3. **Local dev port** — the port the app listens on
4. **Production URL(s)** — so we can add them to hard guards (never run against prod)
5. **Database URL** — connection string for the test DB (or "none" if mocked)
6. **Tables to truncate** — between test runs, to prevent state leakage
7. **Auth model** — JWT/session cookie/mock bridge. If the project has a mock-bridge-like abstraction, fresh UUID per user per test works great; otherwise we need a seeding helper.
8. **Flows to cover** — list from the user, e.g. "auth, create record, update, delete, multi-user interaction, i18n switch"
9. **DOM ids/data-testid already present** — so specs can select them; if absent, NOTE them as a precondition the user has to add.

**If any of the above is unclear, STOP and ask.** A suite built on wrong assumptions wastes time.

## Hard invariants (non-negotiable — violate these and the skill has failed)

- **Never run against production.** globalSetup must `fail()` on any env var that points to prod.
- **workers: 1.** Parallel workers race on server-side singleton state. Period.
- **DB TRUNCATE pre-start**, not just per-test. Crash-recovery will rehydrate zombie rows from a previous failed run and corrupt state.
- **Test-only reset endpoint gated by `NODE_ENV=test`.** Never mount it in production.
- **Fresh tokens per test.** No shared accounts. If the mock auth gives a default balance/state to any new UUID, take advantage of it.
- **Test-reset endpoint called in `beforeEach`**, not just once. Every test starts from zero.

## Steps

### 1. Install deps

```bash
cd <project-root>
npm install -D @playwright/test pg   # add `pg` only if DB is Postgres
npx playwright install --with-deps chromium
```

Only install `chromium` unless the user explicitly needs Firefox/Webkit — it cuts install size by ~400MB.

### 2. Write `playwright.config.ts` at project root

```typescript
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests/e2e',
  globalSetup: './tests/e2e/global-setup.ts',
  globalTeardown: './tests/e2e/global-teardown.ts',
  // Single worker — server state is a process-singleton. Parallel workers would race.
  workers: 1,
  fullyParallel: false,
  timeout: 30_000,
  expect: { timeout: 10_000 },
  forbidOnly: !!process.env.CI,
  retries: 0,
  reporter: [
    ['html', { outputFolder: 'tests/e2e/report', open: 'never' }],
    ['list'],
  ],
  use: {
    baseURL: process.env.APP_URL ?? 'http://localhost:<PORT>',
    trace: 'retain-on-failure',
    video: 'retain-on-failure',
    screenshot: 'only-on-failure',
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
  ],
});
```

Replace `<PORT>` with the dev port, and rename `APP_URL` to the project's convention if it has one.

### 3. Write `tests/e2e/global-setup.ts`

```typescript
import { spawn, spawnSync, type ChildProcess } from 'node:child_process';
import { mkdirSync, openSync, writeFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { Client } from 'pg'; // drop if DB is not Postgres

const __dirname = dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = join(__dirname, '..', '..');
const ARTIFACTS = join(__dirname, '.artifacts');
const PID_FILE = join(ARTIFACTS, 'server.pid');
const LOG_FILE = join(ARTIFACTS, 'server.log');
const PORT = '<PORT>';

// --- DB config (adjust or remove if project is stateless) ---
const DB_URL = process.env.DATABASE_URL ?? '<FALLBACK_DB_URL>';
const TABLES_TO_TRUNCATE = [/* user-provided tables */];

// --- Stubs for env vars the server refuses to start without ---
const ADMIN_STUB = ['e2e', 'admin', 'stub', 'unused'].join('-');

function fail(msg: string): never {
  console.error('\n❌  e2e setup: ' + msg + '\n');
  throw new Error(msg);
}

function isPortBusy(port: string): boolean {
  const r = spawnSync('lsof', ['-i', ':' + port], { encoding: 'utf8' });
  return r.status === 0 && r.stdout.trim().length > 0;
}

async function waitFor(label: string, fn: () => Promise<boolean>, totalMs = 20_000, intervalMs = 500): Promise<void> {
  const deadline = Date.now() + totalMs;
  while (Date.now() < deadline) {
    if (await fn()) return;
    await new Promise(r => setTimeout(r, intervalMs));
  }
  fail(`timed out waiting for ${label} after ${totalMs}ms`);
}

async function dbReady(): Promise<boolean> {
  const client = new Client({ connectionString: DB_URL, connectionTimeoutMillis: 1000 });
  try {
    await client.connect();
    await client.query('SELECT 1');
    await client.end();
    return true;
  } catch {
    return false;
  }
}

async function truncateAll(): Promise<void> {
  if (TABLES_TO_TRUNCATE.length === 0) return;
  const client = new Client({ connectionString: DB_URL });
  await client.connect();
  try {
    await client.query(`TRUNCATE ${TABLES_TO_TRUNCATE.join(', ')} CASCADE;`);
  } finally {
    await client.end();
  }
}

async function serverReady(): Promise<boolean> {
  try {
    const res = await fetch(`http://localhost:${PORT}/health`, { signal: AbortSignal.timeout(800) });
    return res.ok;
  } catch {
    return false;
  }
}

export default async function globalSetup() {
  // ─── HARD GUARDS — never let the suite touch production ──────────────
  const PROD_ENV_VARS = [/* project-specific env vars that signal prod */];
  for (const v of PROD_ENV_VARS) {
    if (process.env[v]) {
      fail(`${v} is set — refusing to run e2e (would hit production)`);
    }
  }
  const baseURL = process.env.APP_URL;
  // Replace regex with project's production hostnames
  if (baseURL && /your-prod-domain\.com/.test(baseURL)) {
    fail(`APP_URL points to production (${baseURL}) — refusing to run e2e against prod`);
  }
  if (isPortBusy(PORT)) {
    fail(`Port ${PORT} already in use. Stop the existing process or change PORT.`);
  }

  mkdirSync(ARTIFACTS, { recursive: true });

  // ─── 1. Ensure DB is available (skip this block if stateless) ────────
  if (await dbReady()) {
    console.log('[e2e] database already reachable ✓');
  } else {
    const hasDocker = spawnSync('docker', ['--version'], { encoding: 'utf8' }).status === 0;
    if (hasDocker) {
      console.log('[e2e] starting database via docker compose...');
      const dc = spawnSync('docker', ['compose', 'up', '-d', 'postgres'], { cwd: REPO_ROOT, encoding: 'utf8' });
      if (dc.status !== 0) fail(`docker compose failed:\n${dc.stderr || dc.stdout}`);
      await waitFor('database ready', dbReady, 20_000, 500);
    } else {
      fail(`database not reachable at ${DB_URL} and docker is not installed.`);
    }
  }

  // ─── 2. Migrate + truncate PRE-start (prevents crash-recovery rehydrating zombies) ──
  console.log('[e2e] applying migrations + truncating test tables...');
  const mig = spawnSync('node', ['server/migrate.js'], {
    cwd: REPO_ROOT,
    env: { ...process.env, DATABASE_URL: DB_URL },
    encoding: 'utf8',
  });
  if (mig.status !== 0) fail(`migrate failed:\n${mig.stderr || mig.stdout}`);
  await truncateAll();

  // ─── 3. Spawn server with NODE_ENV=test ──────────────────────────────
  console.log('[e2e] spawning local server on port ' + PORT + '...');
  const out = openSync(LOG_FILE, 'w');
  const err = openSync(LOG_FILE, 'a');
  const env: Record<string, string> = {
    ...(process.env as Record<string, string>),
    NODE_ENV: 'test',
    PORT,
    DATABASE_URL: DB_URL,
    ADMIN_JWT_SECRET: ADMIN_STUB,
  };
  for (const v of PROD_ENV_VARS) delete env[v];

  const child: ChildProcess = spawn('node', ['server/index.js'], {
    cwd: REPO_ROOT,
    env,
    stdio: ['ignore', out, err],
    detached: false,
  });
  if (typeof child.pid !== 'number') fail('failed to spawn server');
  writeFileSync(PID_FILE, String(child.pid));

  child.on('exit', code => {
    if (code !== 0 && code !== null) {
      console.error(`[e2e] server exited unexpectedly with code ${code}; check ${LOG_FILE}`);
    }
  });

  await waitFor('server /health', serverReady, 20_000, 500);
  console.log('[e2e] server ready ✓');
}
```

### 4. Write `tests/e2e/global-teardown.ts`

```typescript
import { readFileSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { Client } from 'pg'; // drop if not Postgres

const __dirname = dirname(fileURLToPath(import.meta.url));
const PID_FILE = join(__dirname, '.artifacts', 'server.pid');

const DB_URL = process.env.DATABASE_URL ?? '<FALLBACK_DB_URL>';
const TABLES_TO_TRUNCATE = [/* same list as global-setup */];

export default async function globalTeardown() {
  if (existsSync(PID_FILE)) {
    const pid = parseInt(readFileSync(PID_FILE, 'utf8').trim(), 10);
    if (Number.isFinite(pid)) {
      try {
        process.kill(pid, 'SIGTERM');
        console.log(`[e2e] server pid ${pid} sent SIGTERM`);
      } catch {
        console.warn(`[e2e] server already stopped (pid ${pid})`);
      }
    }
  }

  if (TABLES_TO_TRUNCATE.length > 0) {
    try {
      const client = new Client({ connectionString: DB_URL });
      await client.connect();
      await client.query(`TRUNCATE ${TABLES_TO_TRUNCATE.join(', ')} CASCADE;`);
      await client.end();
      console.log('[e2e] truncated test tables ✓');
    } catch (e) {
      console.warn('[e2e] teardown truncate skipped:', (e as Error).message);
    }
  }
}
```

### 5. Write `tests/e2e/fixtures/<project>.ts`

```typescript
import { test as base, expect, type BrowserContext, type Page } from '@playwright/test';
import crypto from 'node:crypto';

export type User = {
  context: BrowserContext;
  page: Page;
  token: string;
};

async function spawnUser(browser: import('@playwright/test').Browser): Promise<User> {
  const token = crypto.randomUUID();
  const context = await browser.newContext();
  await context.addInitScript(t => {
    // MATCH THE PROJECT'S AUTH STORAGE KEY — most common breakage point
    localStorage.setItem('<AUTH_TOKEN_KEY>', t as string);
  }, token);
  const page = await context.newPage();
  await page.goto('/');
  // Wait for an assertion that only passes once the app has finished hydrating/authing
  await expect(page.locator('<AUTH_SIGNAL_SELECTOR>')).not.toHaveText('', { timeout: 10_000 });
  return { context, page, token };
}

type Fixtures = {
  freshUser: User;
  twoUsers: { a: User; b: User };
};

export const test = base.extend<Fixtures>({
  freshUser: async ({ browser }, use) => {
    const u = await spawnUser(browser);
    await use(u);
    await u.context.close();
  },
  twoUsers: async ({ browser }, use) => {
    const a = await spawnUser(browser);
    const b = await spawnUser(browser);
    await use({ a, b });
    await a.context.close();
    await b.context.close();
  },
});

// Reset server singleton state before every test. Requires /admin/test-reset
// endpoint mounted only when NODE_ENV=test.
test.beforeEach(async ({ request }) => {
  const res = await request.post('/admin/test-reset');
  expect(res.ok()).toBeTruthy();
});

// Best-effort per-test cleanup. Ignore failures (page might be closed).
test.afterEach(async ({ page }) => {
  try {
    await page.evaluate(() => {
      // project-specific cleanups (cancel searches, cancel tables, etc.)
    });
  } catch {
    // fine
  }
});

export { expect };
```

### 6. Add the test-only reset endpoint on the server

In the server entrypoint, mount `/admin/test-reset` ONLY when `NODE_ENV=test`. Example for Express:

```javascript
if (process.env.NODE_ENV === 'test') {
  app.post('/admin/test-reset', (_req, res) => {
    // Drain every in-memory singleton the server keeps:
    // - matchmaker queues
    // - active-records map
    // - user-socket map
    // - session map
    // - timers (clearTimeout each, then clear the map)
    // - any other state
    try {
      resetAllSingletons();
      res.json({ ok: true });
    } catch (e) {
      res.status(500).json({ ok: false, error: (e as Error).message });
    }
  });
  console.warn('TEST mode — /admin/test-reset endpoint mounted');
}
```

**This endpoint MUST call `clearTimeout` on every active timer** before clearing the Map it stored them in — orphaned timers fire into a zombie state and produce flaky tests.

### 7. Write at least one example spec

```typescript
// tests/e2e/auth.spec.ts
import { test, expect } from './fixtures/<project>';

test.describe('F1 — Auth / first-load session', () => {
  test('top-bar populates after auth with fresh token', async ({ freshUser }) => {
    await expect(freshUser.page.locator('<USERNAME_SELECTOR>')).not.toHaveText('');
    await expect(freshUser.page.locator('<BALANCE_OR_STATE_SELECTOR>')).toContainText('<EXPECTED_VALUE>');
  });
});
```

Priority order for critical paths:
1. Auth / first load
2. Navigation (home → core flow → back)
3. Core feature (the main thing the app does)
4. Payment / money flow (if any)
5. Multi-user interactions (matchmaking, chat, presence)
6. Disconnect / reconnect (almost always surfaces real bugs — spend time here)
7. i18n if the app has it

### 8. Write `tests/e2e/findings.md` template

```markdown
# <Project> — E2E Findings

**Date:** <date>
**Suite:** <N> tests in <M> specs
**Result:** <X passed · Y failed>
**Environment:** local (never prod)

## Bugs by severity

| # | Severity | Flow | Detected by | Observed | Expected | Suggestion (file:line) |
|---|----------|------|-------------|----------|----------|------------------------|
| 1 | 🔴 CRITICAL | … | … | … | … | … |

## Executive summary

### Bugs confirmed (detected by the suite)
- …

### Bugs by inspection (no test failed but should be fixed)
- …

## Recommended next steps

1. Fix CRITICAL first
2. Re-run: `npm run test:e2e`
3. `npm run test:e2e:report` to view traces
```

### 9. Add scripts to `package.json`

```json
"scripts": {
  "test:e2e": "playwright test",
  "test:e2e:headed": "playwright test --headed",
  "test:e2e:ui": "playwright test --ui",
  "test:e2e:report": "playwright show-report tests/e2e/report"
}
```

### 10. Add `.gitignore` entries

```
tests/e2e/.artifacts/
tests/e2e/report/
test-results/
playwright-report/
```

## Gotchas learned the hard way (pre-empt them)

### `toBeVisible` / `toBeHidden` lies when CSS uses only `opacity`
An element with `display: flex; opacity: 0` is still *visible* to Playwright — the locator resolves and dimensions are non-zero. If the project has overlays/modals, AUDIT the CSS: toggle must use `visibility: hidden/visible` (or `display: none`), not just opacity. Flag this to the user as a precondition.

### Pointer-events on overlapping elements
Chess boards, tables with absolutely-positioned children, draggable items — the overlapping element often has a click handler that `stopPropagation()`, so clicking the layer underneath doesn't fire. Workaround: `locator.click({ force: true })`. Document this in a rule the spec author can see.

### Socket.io transport upgrade looks like a disconnect
When a socket upgrades polling→websocket, the server's `socket.on('disconnect')` fires. If your disconnect timer fires notifications, you'll spam the other side on every page load. Solution in the server: a `reconnectGrace` map that ignores disconnects within N seconds of a prior reconnect. Surface this quirk; if absent, the project will have flaky tests.

### DB crash-recovery rehydrates zombie rows
If the app persists active-session rows and reads them on startup, a test run that crashed mid-test will re-load them on the next run. `TRUNCATE` **before** starting the server, not just after.

### Events on socket fire before the browser page boots
`socket.emit` before the page is fully loaded silently drops. Fixture's `spawnUser` must wait on a post-auth DOM signal (not just `page.goto`) before returning.

### Expose state to window for assertions
In-app state that's hard to observe from the DOM should be exposed on `window` (gated by `NODE_ENV=test` if you care about prod hygiene). Tests can then poll with `page.waitForFunction`.

### Reconnect overlay on the wrong event
If the UX shows a "disconnected" overlay while waiting for reconnect, the server must emit the notification **at the start** of the grace window, not the end — otherwise the overlay never clears on reconnect because the session already ended. This is a real critical bug pattern.

### Grace periods compound
Socket.io `pingInterval`+`pingTimeout` (default 25s+20s=45s) STACK on top of your app-level reconnect timeout. Test timeouts have to budget for both. In the test env, lower both via config override or env var.

### Single worker, no exceptions
Repeat: `workers: 1`. The one time you think "this test is read-only, it could parallelize" — it can't, because the OTHER tests in the file share the same server process singleton. Honor the invariant.

## Verification / Exit Criteria

- `npm run test:e2e` runs green on a fresh checkout (no leftover state assumed)
- Running the suite with `APP_URL=https://prod.example.com` or any prod-signalling env var FAILS at globalSetup, never reaches a browser
- `/admin/test-reset` returns 404 when `NODE_ENV !== 'test'` (grep the server log for it)
- Findings.md is populated with at least "Bugs confirmed" OR "No bugs detected yet" — never empty
- The suite finishes in under 5 minutes (if not, reduce flow count or cut timeouts; do NOT just raise the default)

## When to hand this off to the project-specific e2e-runner agent

Once the suite exists, future runs go through the `e2e-runner` agent (not this skill). This skill is for scaffolding only. If the suite is already scaffolded, STOP and invoke `e2e-runner` instead.
