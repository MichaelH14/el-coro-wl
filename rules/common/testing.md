# Testing

Standards for writing reliable, maintainable tests.

## 80% Coverage Minimum

All projects must maintain at least 80% code coverage. Critical paths (auth, payments, data processing) require higher.

**Why:** Coverage below 80% means large portions of code are untested. Above 80% catches the majority of regressions without diminishing returns.

## Descriptive Test Names

Test names must explain what is being tested and what the expected outcome is.

```typescript
// Bad
test("login", () => { ... });
test("error case", () => { ... });

// Good
test("login rejects invalid email format with validation error", () => { ... });
test("expired token returns 401 and triggers refresh flow", () => { ... });
```

**Why:** When a test fails, the name is the first thing you see. A good name tells you what broke without reading the test body.

## No Mocking Database in Integration Tests

Integration tests must use a real database (test instance). Mock only external services you don't control.

**Why:** Mocked databases hide real query issues (N+1, constraint violations, transaction behavior). The point of integration tests is to test real integration.

## Arrange-Act-Assert Pattern

Every test follows the AAA structure:

```typescript
test("user creation assigns default role", async () => {
  // Arrange
  const userData = { name: "Test User", email: "test@example.com" };

  // Act
  const user = await createUser(userData);

  // Assert
  expect(user.role).toBe("viewer");
});
```

**Why:** Consistent structure makes tests scannable. You can immediately identify setup, action, and expectation.

## Independent Tests

Each test must be fully independent. No shared mutable state between tests. Each test sets up its own data and cleans up after itself.

**Why:** Shared state creates order-dependent tests that pass in isolation but fail together (or vice versa). These are the hardest bugs to track.

## Test Edge Cases

Every test suite must include edge cases:

- **Empty input** — empty strings, empty arrays, null
- **Null/undefined** — missing optional fields
- **Large data** — arrays with 10k+ items, long strings
- **Invalid input** — wrong types, malformed data
- **Boundary values** — 0, -1, MAX_INT, empty string vs null

**Why:** Happy-path tests only prove the code works when everything is perfect. Production is never perfect.
