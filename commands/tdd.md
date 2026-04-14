---
name: tdd
description: Start Test-Driven Development workflow for a feature
arguments: <feature> — description of the feature to implement
---

# /tdd

You have been invoked to implement a feature using strict TDD.

## Workflow

Invoke the test-driven-development skill and dispatch the `tdd-guide` agent.

1. **Understand** — Parse the feature description.
   - Identify inputs, outputs, edge cases, and acceptance criteria.
   - If the feature is vague, ask ONE clarifying question, then proceed.

2. **Red Phase** — Write FAILING tests first.
   - Write tests that define the expected behavior.
   - Run tests — they MUST fail. If they pass, the tests are wrong.
   - Cover: happy path, edge cases, error cases.

3. **Green Phase** — Write MINIMUM code to pass tests.
   - Implement the simplest thing that makes all tests green.
   - Do NOT over-engineer. Do NOT add features not covered by tests.
   - Run tests — they MUST all pass.

4. **Refactor Phase** — Clean up without changing behavior.
   - Remove duplication, improve naming, simplify logic.
   - Run tests after EVERY refactoring step — they must stay green.
   - Extract helpers or utilities if code is reused.

5. **Coverage Check** — Verify coverage meets threshold.
   - Target: 80% minimum coverage for the new feature code.
   - If below 80%, add more tests for uncovered paths.
   - Report coverage breakdown per file.

6. **Summary** — Present results:
   - Tests written: count and descriptions.
   - Implementation: files created/modified.
   - Coverage: percentage with breakdown.
   - Suggest `/review` as next step.

## Rules
- NEVER write implementation code before tests.
- NEVER skip the refactor phase — it's where quality lives.
- Tests must be deterministic — no flaky tests allowed.
- Each test should test ONE thing with a clear name.
