---
name: result-aggregation
description: Use when conductor needs to collect and merge results from multiple dispatched agents into a unified report for qa-gate
---

# Result Aggregation

Collect, merge, and organize results from all dispatched agents into a coherent report.

## Preconditions

- At least one agent has completed its task and returned results
- qa-gate is available to receive the aggregated report
- State store is accessible for result logging

## Steps

### 1. Collect Results

Gather results from all dispatched agents as they complete. For each result, capture:

```json
{
  "agent": "code-reviewer",
  "task_id": "task-20260331-001",
  "status": "completed",
  "findings": [...],
  "files_touched": ["src/api/handler.ts"],
  "duration": "12s"
}
```

Wait for all agents in a dispatch group to complete before aggregating. Timeout: 5 minutes per agent.

### 2. Do NOT Filter or Summarize

Pass **complete** results to qa-gate. Conductor does not decide what's important — that's qa-gate's job. Never:

- Drop findings deemed "minor"
- Summarize detailed feedback into one-liners
- Silently resolve conflicting recommendations

### 3. Merge Findings on Shared Files

When multiple agents report on the same file:

- Group all findings by file path
- Preserve each agent's perspective (label findings with source agent)
- Flag contradictions explicitly: "code-reviewer says X, security-reviewer says Y"
- Let qa-gate resolve conflicts

### 4. Organize by Severity

Present the aggregated report ordered by severity:

1. **Critical** — build broken, security vulnerability, data loss risk
2. **High** — bugs, logic errors, failing tests
3. **Medium** — code quality, performance concerns, missing tests
4. **Low** — style, naming, optional improvements

Within each severity level, group by file for readability.

### 5. Deliver to qa-gate

Hand off the complete, organized report. Include metadata:

- Total agents dispatched vs. completed
- Any agent timeouts or failures
- Overall task duration

## Verification / Exit Criteria

- All dispatched agents accounted for (completed or timed out)
- No findings were filtered or lost during aggregation
- Shared-file findings properly merged with agent attribution
- Report organized by severity (critical -> low)
- qa-gate received the complete report
- Aggregation logged in state store with timing data
