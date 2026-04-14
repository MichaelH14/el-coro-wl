---
name: qa
description: Force manual QA gate on current project state
arguments: none
---

# /qa

You have been invoked to run a full QA gate on the current project.

## Workflow

Dispatch the `qa-gate` agent to run the complete quality checklist.

1. **Code Quality**
   - Lint passes with zero errors.
   - No `@ts-ignore`, `any` casts, or `eslint-disable` without justification.
   - No TODO/FIXME/HACK comments for the current feature.
   - No console.log left in production code.

2. **Build Verification**
   - `npm run build` (or equivalent) passes cleanly.
   - No warnings treated as errors.
   - Output bundle is reasonable size.

3. **Test Verification**
   - All tests pass.
   - Coverage meets 80% minimum threshold.
   - No skipped tests (`.skip`) without documented reason.
   - No flaky tests (run twice if suspicious).

4. **Functionality Check**
   - If UI: all states rendered (empty, loading, error, success, edge cases).
   - If API: all endpoints respond correctly with valid and invalid inputs.
   - If service: starts cleanly and handles graceful shutdown.

5. **Completeness Check**
   - All acceptance criteria from the plan/task are met.
   - No half-implemented features.
   - Error messages are user-friendly, not raw stack traces.
   - Environment variables are documented.

6. **Verdict** — One of:
   - **PASS**: Everything checks out. Ready to deploy.
   - **CONDITIONAL PASS**: Minor issues noted but not blocking.
   - **FAIL**: Blocking issues found. List each with required fix.

## Rules
- QA gate is OBJECTIVE — no "it's probably fine" verdicts.
- Every FAIL must include a specific description and location.
- CONDITIONAL PASS items must be tracked and resolved before next release.
- qa-gate agent has VETO power — if it says FAIL, it's FAIL.
