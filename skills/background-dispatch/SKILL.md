---
name: background-dispatch
description: Use when conductor needs to run background agents for proactive checks without interrupting the active session
---

# Background Dispatch

Conductor runs background agents for proactive quality checks without interrupting the user's active work.

## Preconditions

- the user has an active foreground task OR a recent commit to check
- Background resource budget available (< 30% utilization)
- State store accessible for logging results

## Steps

### 1. Evaluate Priority

Strict priority ordering — never violate:

1. **the user's active request** — all resources available
2. **qa-gate fix in progress** — background yields
3. **Background work** — max 30% of resources

If the user sends a new message while background work is running, background tasks pause immediately.

### 2. Identify Background Work

Post-commit triggers:
- Lint the changed files
- Type-check affected modules
- Run tests related to changed files (not full suite)
- Security scan on new dependencies

Proactive triggers:
- Stale TODO detection in recently touched files
- Import cycle detection after refactors
- Dead code detection in modified modules

### 3. Dispatch Agents

Spawn background agents with explicit constraints:

```json
{
  "mode": "background",
  "priority": "low",
  "max_duration": "60s",
  "resource_cap": "30%",
  "report_policy": "issues_only"
}
```

Each background agent runs silently. No output to the user unless issues are found.

### 4. Collect Results

Results flow into state store silently:

- **Clean results**: log only, no notification
- **Issues found**: queue for reporting at next natural break
- **Critical issues**: interrupt immediately (build broken, security vulnerability)

### 5. Log Everything

All background activity logged to state store regardless of outcome. This feeds Cortex's learning pipeline.

## Verification / Exit Criteria

- Background work never exceeded 30% resource cap
- the user's active requests were never delayed by background work
- Clean results logged silently (no unnecessary interruptions)
- Issues found are queued for reporting with proper severity
- All background activity traceable in state store logs
