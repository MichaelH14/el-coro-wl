---
name: systematic-debugging
description: Use when encountering any bug, test failure, or unexpected behavior, before proposing fixes
---

# Systematic Debugging

Never guess at fixes. Follow the process: reproduce, isolate, fix root cause, verify, document.

## Preconditions

- A bug or unexpected behavior has been reported or observed
- Access to the codebase where the bug exists
- Ability to run the code and tests

## Steps

### 1. REPRODUCE

Confirm the bug exists with concrete evidence:

- Write a failing test that demonstrates the bug, OR
- Document exact reproduction steps (input -> expected -> actual)
- If bug is intermittent: identify conditions that increase frequency

**Do not proceed until you can reliably reproduce the bug.** An unreproducible bug is not debuggable.

### 2. ISOLATE

Binary search to find the exact cause:

- **Which file?** — narrow from module level to specific file
- **Which function?** — trace the call path
- **Which line?** — add strategic logging or breakpoints
- **Which condition?** — what input triggers the bug?

Techniques:
- `git bisect` to find the commit that introduced it
- Comment out code blocks to narrow scope
- Add assertions at function boundaries
- Check recent changes to suspect files

### 3. FIX

Fix the **ROOT CAUSE**, not the symptom:

- If a null check fixes the crash but the data should never be null: fix why it's null
- If a retry fixes the timeout but the query is slow: fix the query
- If a try/catch hides the error: find why the error happens

Before writing the fix:
- Understand WHY the bug exists (design flaw? missing validation? race condition?)
- Consider if the same class of bug exists elsewhere
- Fix should be minimal: change as few lines as possible

### 4. VERIFY

Confirm the fix works completely:

- The failing test from step 1 now passes
- All existing tests still pass (no regressions)
- Manual reproduction steps no longer trigger the bug
- Edge cases of the same bug class are also covered

### 5. DOCUMENT

Record what happened for Cortex to learn:

```json
{
  "bug": "Brief description",
  "root_cause": "Why it happened",
  "fix": "What was changed",
  "prevention": "How to avoid this class of bug",
  "files_affected": ["path/to/file.ts"]
}
```

Feed this to Cortex for pattern detection. If this is the 3rd bug of the same class, Cortex should create an instinct.

## Verification / Exit Criteria

- Bug is reproducible (test or steps documented)
- Root cause identified (not just symptoms)
- Fix addresses root cause specifically
- All tests pass (new and existing)
- No regressions introduced
- Bug documented for Cortex learning pipeline
