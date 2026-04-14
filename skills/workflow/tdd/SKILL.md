---
name: tdd
description: Use when implementing any feature or bugfix, to follow test-driven development methodology with the RED-GREEN-REFACTOR cycle
---

# Test-Driven Development

Write tests before implementation. Every behavior starts as a failing test.

## Preconditions

- Test framework is configured and running (jest, vitest, pytest, etc.)
- Clear understanding of the behavior to implement
- Existing tests pass before starting

## Steps

### 1. RED - Write Failing Test

Write a test that describes the expected behavior:

- Test name describes the behavior, not the implementation
- Test is specific: one behavior per test
- Test actually fails (run it to confirm)
- Failure message is meaningful (not just "undefined is not a function")

```
GOOD: "should return 404 when user not found"
BAD:  "test getUserById"
```

### 2. GREEN - Minimum Code to Pass

Write the absolute minimum code to make the test pass:

- No premature optimization
- No extra features "while I'm here"
- No refactoring yet
- Just make the red test turn green

Run the test. If it passes, proceed. If not, fix the implementation (not the test).

### 3. REFACTOR - Clean Up

Now that the test is green, clean up:

- Remove duplication
- Improve naming
- Extract functions if needed
- Simplify logic

**Critical**: run tests after every refactor step. If any test goes red, undo the last refactor.

### 4. Repeat

Pick the next behavior. Go back to RED. Continue until all behaviors are covered.

Order of behaviors to implement:
1. Happy path (main success scenario)
2. Edge cases (empty input, boundaries)
3. Error cases (invalid input, failures)
4. Integration points (external services, DB)

### 5. Coverage Check

After all behaviors are implemented:

- Run coverage report
- **Minimum 80% coverage** (lines and branches)
- Missing coverage = missing tests, not missing implementation
- If below 80%: identify untested behaviors, write more RED tests

### 6. Final Test Run

Run the complete test suite:

- All new tests pass
- All existing tests still pass (no regressions)
- No skipped or pending tests left behind
- Test execution time is reasonable

## Verification / Exit Criteria

- Every implemented behavior has a corresponding test
- All tests pass (zero failures)
- Coverage >= 80% (lines and branches)
- No test depends on execution order
- No flaky tests (run suite twice to confirm)
- Refactoring did not break any tests
