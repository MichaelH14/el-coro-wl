---
name: verification
description: Use before declaring any work complete, to run all verification checks and cross-reference against the original request
---

# Verification

Comprehensive check before declaring any work complete. No shortcuts.

## Preconditions

- Implementation work is believed to be complete
- Test framework and build tools are configured
- Original request/requirements are available for cross-reference

## Steps

### 1. Run All Tests

```bash
npm test        # or equivalent for the project
```

- ALL tests must pass. Zero failures, zero errors.
- No skipped tests unless pre-existing and documented.
- If any test fails: fix before continuing. Do not declare done with failing tests.

### 2. Build Check

```bash
npm run build   # or equivalent
```

- Build must complete without errors.
- Warnings should be reviewed — new warnings from your changes need attention.

### 3. Lint Check

```bash
npm run lint    # or equivalent
```

- Zero lint errors from your changes.
- Pre-existing lint warnings are acceptable but don't add new ones.

### 4. Type Check

```bash
npx tsc --noEmit   # or equivalent
```

- Zero type errors.
- No `any` types added unless absolutely necessary and justified.

### 5. Clean Code Scan

Check for development artifacts that must not ship:

- No `console.log` or debug statements left behind
- No commented-out code blocks
- No TODO/FIXME added without a tracking issue
- No hardcoded secrets, URLs, or credentials
- No `.only` on tests (test.only, describe.only)

### 6. Cross-Reference Original Request

Re-read the original request and verify point by point:

- Every requirement addressed
- No scope creep (nothing added that wasn't asked for)
- Edge cases considered
- Error handling implemented where needed

### 7. Final Diff Review

Review the complete diff of your changes:

```bash
git diff
```

- Every changed line is intentional
- No accidental whitespace or formatting changes
- No unrelated changes mixed in

## Verification / Exit Criteria

- All tests pass
- Build succeeds
- Zero lint errors from changes
- Zero type errors
- No debug artifacts (console.log, .only, commented code)
- Original request fully addressed
- Diff is clean and intentional
- Only after ALL checks pass: declare work complete
