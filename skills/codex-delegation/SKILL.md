---
name: codex-delegation
description: Use when deciding whether to delegate a coding task to Codex/GPT, or when a Codex task fails and needs takeover or QA review
---

# Codex Delegation

Rules for delegating code tasks to Codex (GPT). Delegate simple work, keep complex work, always QA the output.

## Preconditions

- Codex CLI available and authenticated
- Task complexity assessed
- QA gate process ready to review output

## Steps

### 1. When to Delegate

Delegate to Codex when complexity < 0.4 (simple, well-defined tasks):

**Good for Codex**:
- Boilerplate code generation (CRUD endpoints, schemas)
- Type definitions from specs
- Test stubs from function signatures
- Config file generation
- Simple refactoring (rename, extract function)
- Documentation generation

**Keep for Claude**:
- Complex business logic
- Architecture decisions
- Multi-file coordinated changes
- Debugging (requires deep context)
- Security-sensitive code
- Anything requiring the user's project-specific knowledge

### 2. Sanitize Before Sending

Before sending to Codex:
- Strip secrets, API keys, credentials from context
- Remove production URLs and internal hostnames
- Remove user data and PII
- Keep only the code structure and task description
- Include relevant type definitions for context

What to include:
```
- Function signatures needed
- Input/output types
- Expected behavior description
- Relevant interfaces/types
- Test expectations
```

What to exclude:
```
- .env contents
- Database connection strings
- API keys or tokens
- Production URLs
- User data samples
```

### 3. Two-Failure Rule

If Codex output fails QA twice on the same task:
- Stop delegating that task
- Claude takes over immediately
- Log the failure pattern for future routing decisions
- Do not send the same task a third time

Failure means: output does not pass qa-gate, has bugs, or requires significant rework.

### 4. QA Gate (All Codex Output)

Every piece of Codex output goes through QA before integration:

```
1. Type check: does it compile? (tsc --noEmit)
2. Lint: does it pass linter? (eslint)
3. Test: do existing tests still pass?
4. Review: does the logic match the spec?
5. Security: no hardcoded values, no SQL injection, no XSS?
6. Style: matches project patterns and conventions?
```

If any check fails: fix or reject. Do not merge raw Codex output.

### 5. Logging

Track delegation outcomes:
```json
{
  "task": "generate CRUD for tickets endpoint",
  "delegated_to": "codex",
  "complexity": 0.3,
  "attempts": 1,
  "qa_passed": true,
  "modifications_needed": "minor type fixes",
  "time_saved_estimate": "15 minutes"
}
```

Over time, this data improves routing decisions (which tasks Codex handles well).

## Verification / Exit Criteria

- Task complexity assessed before delegation (< 0.4 for Codex)
- Context sanitized (no secrets, no PII, no production URLs)
- Two-failure rule enforced (max 2 attempts per task)
- QA gate applied to all Codex output (compile, lint, test, review)
- Delegation outcomes logged for continuous improvement
