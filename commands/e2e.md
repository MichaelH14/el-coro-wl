---
name: e2e
description: Run (or scaffold + run) the E2E Playwright suite for the current project
arguments: "[--scaffold-only | --headed | --ui | <spec-path>] (optional)"
---

# /e2e

One-shot command to run end-to-end tests. Handles the full lifecycle:
**detect → install → scaffold → run → report**. Zero friction — if the project
doesn't have Playwright yet, the command installs it, scaffolds the suite
(config + fixtures + global setup + test-reset endpoint + example specs),
then runs.

Dispatch the `e2e-runner` agent with autonomous execution enabled.

## Workflow

1. **Detect suite presence**:
   - `test:e2e` script in `package.json`?
   - `playwright.config.(ts|js)` at project root?
   - `@playwright/test` in devDependencies?
   - `tests/e2e/` with at least one `.spec.ts`?

   If everything is there → jump to step 4 (Run).
   If anything is missing → step 2 (Scaffold).

2. **Scaffold if missing** — invoke the `playwright-suite-writer` skill
   and EXECUTE each step (don't just prescribe). Infer whatever you can
   from the repo BEFORE asking the user:
   - Port: grep `PORT` / `listen(` in server entry + package.json scripts.
   - DB URL: read `docker-compose.yml`, `.env.example`, or existing scripts.
   - Stack: check dependencies (express/koa/fastify/next).
   - Prod URLs: read README or project docs.
   - Auth model: grep for `jwt`, `session`, `bcrypt`, `passport` in server.
   - DOM selectors: grep for `data-testid`, `id=` in HTML/JSX.

   Only ask the user for what you genuinely can't infer (usually: which flows
   to cover). Ask once, in a single compact prompt, not per-field.

3. **Install + init**:
   - `npm install -D @playwright/test` (+ `pg` if DB is Postgres).
   - `npx playwright install --with-deps chromium`.
   - Write config, global-setup, global-teardown, fixtures, first spec,
     findings.md template.
   - Mount `/admin/test-reset` in the server (only `NODE_ENV=test`).
   - Add `test:e2e*` scripts to `package.json`.
   - Add `tests/e2e/.artifacts/`, `tests/e2e/report/`, `test-results/`,
     `playwright-report/` to `.gitignore`.
   - Run a smoke check: `npm run test:e2e` once to confirm the scaffold works.

4. **Run**:
   - With no args: `npm run test:e2e`.
   - With `--headed`: `npm run test:e2e:headed`.
   - With `--ui`: `npx playwright test --ui`.
   - With a spec path: `npx playwright test <path>`.
   - With `--scaffold-only`: stop after step 3.

5. **Report** — use the format from the `e2e-runner` agent's Report section.
   Always include: total/passed/failed/skipped, duration, flaky count,
   per-failure details with file:line and suggested fix.

6. **If tests failed**: do NOT try to fix them silently. List each failure,
   suggest a root-cause fix, and ask the user which to tackle.

## Rules

- Hard guards: refuse to run against production. Check env vars and URLs
  against a prod regex before spawning browsers.
- Single worker in the config (`workers: 1`). Do not parallelize.
- DB TRUNCATE pre-start, not just per-test.
- Never mount `/admin/test-reset` outside `NODE_ENV=test`.
- If the user's project already has its own testing convention (Cypress,
  WebdriverIO, etc), ASK before replacing — don't silently migrate.
- Post-scaffold, add a one-line summary of what landed + how to re-run.

## Output

Report block:

```
=== /e2e ===
Project: [name]
Suite presence: [existing | scaffolded in this run]
Tests: [passed]/[total] in [duration]
Failures: [listed below if any]
Next: [specific recommendation]
```
