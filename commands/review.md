---
name: review
description: Full code review with multiple specialist reviewers
arguments: "[files] — specific files or directories to review (optional, defaults to changed files)"
---

# /review

You have been invoked to perform a comprehensive code review.

## Workflow

1. **Scope Detection** — Determine what to review.
   - If files specified: review those files.
   - If no files specified: detect changed files via `git diff` (staged + unstaged).
   - If no git changes: review the entire project src directory.

2. **Parallel Review Dispatch** — Send to three reviewers simultaneously:
   - **code-reviewer agent**: Logic correctness, error handling, edge cases, naming, structure, DRY violations, complexity.
   - **ts-reviewer agent**: TypeScript-specific — types, generics, null safety, strict mode compliance, import organization.
   - **security-reviewer agent**: Injection vulnerabilities, secrets in code, input validation, auth checks, dependency risks.

3. **Aggregation** — Collect all findings and categorize by severity:
   - **CRITICAL**: Must fix before merge. Security holes, data loss risks, crashes.
   - **WARNING**: Should fix. Code smells, missing error handling, poor patterns.
   - **SUGGESTION**: Nice to have. Style, naming, minor improvements.

4. **QA Gate** — Run qa-gate agent to validate:
   - Build passes.
   - Tests pass.
   - No regressions introduced.
   - Coverage not decreased.

5. **Report** — Present findings as a structured review:
   - Summary: pass/fail with count per severity.
   - Details: each finding with file, line, description, suggested fix.
   - Verdict: APPROVE, REQUEST CHANGES, or BLOCK.

## Rules
- All three reviewers run in PARALLEL — do not wait for one to finish before starting another.
- CRITICAL findings automatically result in REQUEST CHANGES verdict.
- Security findings are NEVER downgraded below WARNING.
- If qa-gate fails, verdict is BLOCK regardless of review findings.
