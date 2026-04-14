---
name: test-coverage
description: Use when evaluating test coverage, deciding what to test next, identifying untested business logic, or reviewing coverage reports
---

# Test Coverage

Coverage is a guide, not a target. Test business logic thoroughly, use coverage to find gaps, not to chase numbers.

## Preconditions

- Test framework configured (Vitest, Jest, or similar)
- Coverage tool available (v8 or istanbul)
- Codebase has identifiable business logic layers

## Steps

### 1. What to Test (Priority Order)

| Priority | Layer | Why |
|----------|-------|-----|
| 1 | Business logic | Incorrect behavior costs money/users |
| 2 | Data transformations | Wrong data = wrong decisions |
| 3 | API handlers | Contract between frontend and backend |
| 4 | Utility functions | Used everywhere, bugs multiply |
| 5 | Configuration | Wrong config = wrong environment |

Do NOT prioritize testing:
- Generated code (Prisma client, OpenAPI types)
- Simple getters/setters with no logic
- Framework boilerplate

### 2. Coverage as a Guide

Run coverage:
```bash
npx vitest run --coverage
```

Use coverage report to find:
- **Uncovered branches**: if/else paths not tested (often error paths)
- **Uncovered functions**: entire functions with no tests (missed features)
- **Low coverage files**: business logic files < 70% coverage

Do NOT:
- Set a coverage threshold and refuse to merge below it
- Write tests just to increase a number
- Test implementation details to hit coverage

### 3. Meaningful Test Patterns

```typescript
// Good: tests behavior
test('calculates lottery prize correctly for 3 matches', () => {
  const prize = calculatePrize({ matches: 3, drawType: 'nacional' });
  expect(prize).toBe(5000);
});

// Bad: tests implementation
test('calls calculatePrize function', () => {
  const spy = jest.spyOn(module, 'calculatePrize');
  doSomething();
  expect(spy).toHaveBeenCalled(); // who cares if it was called?
});
```

### 4. Mutation Testing (Concept)

Mutation testing validates test quality by modifying code and checking if tests catch it:
- Change `>` to `>=` -- does a test fail?
- Remove a condition -- does a test fail?
- Return a different value -- does a test fail?

If mutations survive (tests still pass): tests are weak for that code path.

Tools: Stryker (JS/TS). Run occasionally, not on every commit.

### 5. Coverage Review Checklist

When reviewing coverage reports:
- [ ] All business logic functions have at least happy path + error path tests
- [ ] Edge cases for number handling (0, negative, overflow)
- [ ] Null/undefined inputs to public functions
- [ ] Async error paths (network failure, timeout)
- [ ] Permission checks (authorized vs unauthorized)

## Verification / Exit Criteria

- Business logic has > 80% branch coverage
- Coverage report reviewed for gaps (not just number checked)
- No tests that exist solely to increase coverage percentage
- Tests verify behavior (outputs), not implementation (calls)
- Critical paths identified and all have tests
