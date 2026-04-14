---
name: coverage
description: Test coverage analysis — what's tested, what's missing, priorities
arguments: none
---

# /coverage

You have been invoked to analyze test coverage and recommend improvements.

## Workflow

1. **Run Coverage** — Execute the test suite with coverage reporting.
   - Run `npm run test -- --coverage` (or project-specific command).
   - Parse the coverage report: statements, branches, functions, lines.

2. **Coverage Breakdown** — Present per-file analysis:
   - Files with 90%+ coverage: GOOD. List briefly.
   - Files with 60-89% coverage: NEEDS ATTENTION. List with uncovered lines.
   - Files with <60% coverage: CRITICAL. Detailed analysis of what's missing.
   - Files with 0% coverage: NO TESTS. Flag as high priority.

3. **Gap Analysis** — What's NOT tested:
   - Error handling paths (catch blocks, error callbacks).
   - Edge cases (empty inputs, null values, boundary conditions).
   - Conditional branches (if/else, switch cases, ternary).
   - Integration points (API calls, database operations, external services).

4. **Priority Recommendations** — What to test next, ranked by value:
   - **P1 — Business critical**: Core business logic with no tests.
   - **P2 — Error paths**: Error handling in critical flows.
   - **P3 — Edge cases**: Boundary conditions in well-tested code.
   - **P4 — Nice to have**: Utility functions, formatting, etc.

5. **Report** — Summary:
   - Overall coverage: X% (target: 80%).
   - Delta from target: +X% or -X%.
   - Top 5 files needing tests (ranked by risk).
   - Estimated effort to reach 80%: number of tests to write.

## Rules
- 80% is the MINIMUM target, not the goal.
- Coverage numbers alone don't mean quality — flag tests that assert nothing.
- Prioritize testing business logic over utility functions.
- If overall coverage is below 60%, recommend a dedicated test-writing sprint.
