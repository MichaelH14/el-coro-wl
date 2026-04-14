---
name: refactor
description: Post-feature cleanup — dead code, duplication, broken abstractions
arguments: "[scope] — specific files, directory, or 'all' (optional, defaults to recently changed files)"
---

# /refactor

You have been invoked to clean up code after feature work.

## Workflow

Dispatch the `refactor-cleaner` agent.

1. **Baseline** — Establish safety net BEFORE any changes.
   - Run all tests. They MUST pass. If they don't, fix tests first or abort.
   - Record current test count and coverage as baseline.
   - Commit or stash any uncommitted work.

2. **Analysis** — Scan the scope for refactoring opportunities.
   - **Dead code**: Unused imports, unreachable branches, commented-out code, unused variables/functions.
   - **Duplication**: Copy-pasted logic that should be extracted into shared utilities.
   - **Broken abstractions**: Functions doing too much, god objects, leaky abstractions.
   - **Naming**: Unclear variable/function names, inconsistent conventions.
   - **Complexity**: Functions over 50 lines, deeply nested conditionals, complex boolean expressions.

3. **Prioritize** — Rank refactoring tasks by impact.
   - HIGH: Dead code removal, obvious duplication (safe, high reward).
   - MEDIUM: Extraction of shared utilities, simplification of complex functions.
   - LOW: Naming improvements, minor restructuring.

4. **Execute** — Apply changes incrementally.
   - One refactoring at a time.
   - Run tests AFTER each change — they must stay green.
   - If tests fail after a change, revert that change immediately.

5. **Verify** — Final validation.
   - All tests pass.
   - Coverage has NOT decreased.
   - Build passes.
   - No new lint errors.

6. **Report** — Summary:
   - Changes made: categorized list.
   - Lines removed vs added.
   - Coverage: before → after.

## Rules
- Tests MUST pass before AND after. Non-negotiable.
- One refactoring at a time — never batch multiple unrelated changes.
- If unsure whether a change is safe, DON'T make it.
- NEVER change behavior during refactoring — only structure.
