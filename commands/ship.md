---
name: ship
description: "Review + QA + Deploy combo — from ready to production in one command"
arguments: none
---

# /ship

You have been invoked to take the current work from "ready" to "in production."

## Workflow

This is the full pipeline. Each phase MUST pass before the next begins.

1. **Phase 1: Review** — Execute the full `/review` workflow.
   - Dispatch code-reviewer, ts-reviewer, security-reviewer in parallel.
   - Aggregate findings by severity.
   - If verdict is BLOCK or REQUEST CHANGES with any CRITICAL findings → STOP.
   - Report findings to the user and wait for approval to continue.

2. **Phase 2: QA Gate** — Execute the full `/qa` workflow.
   - qa-gate agent runs the complete checklist.
   - Build, tests, coverage, functionality verification.
   - If qa-gate FAILS → STOP. Do NOT proceed to deploy.
   - Report what failed and what needs fixing.

3. **Phase 3: Deploy** — Execute the full `/deploy` workflow.
   - Only reached if Phase 1 and Phase 2 both PASS.
   - Full deploy with validation, port checks, health checks.
   - If deploy fails, report rollback instructions.

4. **Final Report** — Ship summary:
   - Review: PASS/FAIL + finding count.
   - QA Gate: PASS/FAIL + checklist summary.
   - Deploy: SUCCESS/FAILED + service URL.
   - Total time from start to production.

## Rules
- This is a BLOCKING pipeline — phases are strictly sequential.
- If Phase 1 fails, Phase 2 and 3 do NOT run.
- If Phase 2 fails, Phase 3 does NOT run.
- NEVER skip a phase, even if the user says "just deploy it."
- If any phase fails, present clear instructions on what to fix before retrying.
- After successful ship, suggest running `/health` to verify in 5 minutes.
