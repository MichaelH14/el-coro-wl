---
name: design-review
description: Review current UI for quality issues before shipping
---

# /design-review

Run design-critic agent on the current project's UI.

## What it does:
1. design-critic reviews all UI files (components, pages, layouts)
2. Reports issues by severity: KILL IT / WEAK / POLISH
3. If issues found: designer agent fixes them
4. design-critic reviews again
5. Loop until design-critic approves or max 3 iterations

## Usage:
- `/design-review` — review all UI
- `/design-review src/app/page.tsx` — review specific file

## Agents involved:
- design-critic (reviews)
- designer (fixes)
- qa-gate (final approval)
