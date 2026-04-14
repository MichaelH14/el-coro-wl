---
name: build-fix
description: Fix the current build error automatically
arguments: none
---

# /build-fix

You have been invoked to fix whatever build error is currently happening.

## Workflow

Dispatch the `build-resolver` agent.

1. **Capture Error** — Get the full build output.
   - Run the project's build command (typically `npm run build`).
   - Capture the COMPLETE error output — not just the last line.
   - If there are multiple errors, process them from FIRST to LAST (first error often causes cascading failures).

2. **Diagnose** — Identify the root cause of the build failure.
   - Parse the error message: file, line, error code, description.
   - Common categories:
     - Type errors (TS): missing types, incompatible types, missing imports.
     - Module errors: missing packages, wrong paths, circular deps.
     - Syntax errors: typos, missing brackets, invalid syntax.
     - Config errors: tsconfig, webpack, vite, next.config issues.

3. **Fix** — Apply the minimal fix.
   - Fix the ROOT cause, not the symptom.
   - If it's a missing dependency: install it.
   - If it's a type error: fix the type, don't cast to `any`.
   - If it's a config issue: fix the config, don't disable the check.

4. **Verify** — Run the build again.
   - Build MUST pass cleanly.
   - If new errors appear after fix, repeat the cycle.
   - Maximum 5 fix-verify cycles before escalating to the user.

5. **Report** — What happened:
   - Error: one-line summary.
   - Cause: why it broke.
   - Fix: what was changed.
   - Build status: PASSING.

## Rules
- Read the FULL error, not just the first line.
- Fix the FIRST error first — cascading errors often resolve themselves.
- NEVER suppress errors with `@ts-ignore`, `any`, or `eslint-disable` unless truly justified.
- NEVER modify test files to make build pass — fix the source code.
