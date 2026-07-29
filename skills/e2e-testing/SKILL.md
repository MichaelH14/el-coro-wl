---
name: e2e-testing
description: Use when writing end-to-end tests with Playwright, setting up E2E test infrastructure, or testing critical user paths
---

# E2E Testing

End-to-end tests with Playwright. Test critical user paths. Deterministic, isolated, fast enough for CI.

## Preconditions

- Playwright installed (`npm init playwright@latest`)
- Application running (local or test environment)
- Test database seeded with known state

## Steps

### 1. Setup

```typescript
// playwright.config.ts
import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './tests/e2e',
  timeout: 30000,
  retries: 1,
  workers: 1,  // sequential for reliability
  use: {
    baseURL: 'http://localhost:3000',
    screenshot: 'only-on-failure',
    trace: 'retain-on-failure',
  },
});
```

### 2. Test Critical Paths First

Priority order:
1. **Authentication**: signup, login, logout, password reset
2. **Core feature**: the main thing users do (check lottery results, play chess)
3. **Payment**: any money flow
4. **Data integrity**: creating, updating, deleting user data

Do NOT test:
- Styling (not e2e's job)
- Third-party services (mock them)
- Edge cases (unit tests handle those)

### 3. Write Deterministic Tests

```typescript
test('user can check lottery results', async ({ page }) => {
  // Arrange: seed known data
  await seedTestDraw({ name: 'Nacional', numbers: [12, 34, 56] });

  // Act
  await page.goto('/results');
  await page.click('[data-testid="draw-nacional"]');

  // Assert
  await expect(page.locator('[data-testid="result-numbers"]'))
    .toContainText('12 - 34 - 56');
});
```

Rules:
- Use `data-testid` selectors (not CSS classes or text that changes)
- Seed all test data (never depend on production data)
- Each test independent (no order dependency)
- Clean up after each test (or use isolated test database)

### 4. Avoid Flakiness

- Wait for network idle instead of arbitrary timeouts
- Use `page.waitForSelector()` instead of `page.waitForTimeout()`
- Retry failed tests once (config `retries: 1`)
- Run in headed mode to debug flaky tests
- If a test is flaky 3 times: fix or delete it

### 5. CI Integration

```yaml
# In CI pipeline
- name: E2E Tests
  run: |
    npx playwright install --with-deps
    npm run build
    npm start &
    npx wait-on http://localhost:3000
    npx playwright test
```

Run e2e after unit tests pass. If e2e fails, block deploy.

## Verification / Exit Criteria

- Critical paths (auth, core feature, payments) have e2e coverage
- All tests pass locally and in CI
- No flaky tests (0 failures in 5 consecutive runs)
- Test data seeded and cleaned up (no pollution)
- Tests complete in < 5 minutes total
