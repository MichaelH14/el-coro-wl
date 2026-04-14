---
name: debug
description: Systematic debugging workflow — reproduce, isolate, fix
arguments: <issue> — description of the bug or error
---

# /debug

You have been invoked to systematically debug an issue.

## Workflow

Invoke the systematic-debugging skill and dispatch the `debugger` agent.

1. **Reproduce** — Confirm the bug exists.
   - Read any error messages, stack traces, or logs provided.
   - Create a minimal reproduction case if possible.
   - If the bug cannot be reproduced, gather more context before proceeding.

2. **Isolate** — Narrow down the root cause.
   - Identify the exact file, function, and line where behavior diverges from expectation.
   - Check recent changes (git log, git diff) for likely culprits.
   - Verify assumptions — is the data what you expect? Are configs correct?
   - Rule out environment issues (ports, deps, Node version).

3. **Root Cause Analysis** — Identify WHY, not just WHERE.
   - Understand the underlying cause, not just the symptom.
   - Check if the same pattern exists elsewhere (systemic vs isolated).
   - Document the cause clearly.

4. **Fix** — Apply the fix to the ROOT CAUSE.
   - Fix the actual cause, not the symptom. No patches on top of patches.
   - Keep the fix minimal and focused — do not refactor unrelated code.
   - Write or update a test that would have caught this bug.

5. **Verify** — Confirm the fix works and nothing else broke.
   - Run the reproduction case — bug should be gone.
   - Run full test suite — no regressions.
   - Check related functionality for side effects.

6. **Report** — Present findings:
   - Root cause: one sentence.
   - Fix applied: files and changes.
   - Test added: what it covers.
   - Lessons: anything to prevent similar bugs.

## Rules
- NEVER guess at fixes without reproducing first.
- ALWAYS fix root cause, never patch symptoms.
- ALWAYS add a regression test.
- If stuck after 3 attempts to isolate, escalate to the user with findings so far.
