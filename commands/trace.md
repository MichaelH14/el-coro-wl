---
name: trace
description: Detailed agent activity log — who did what, when, why
arguments: "[agent] — filter to specific agent name (optional, shows all if omitted)"
---

# /trace

You have been invoked to show a detailed trace of agent activity.

## Workflow

Read from the state store's activity log.

1. **Load Trace Data** — Read agent activity records.
   - If an agent name is specified, filter to only that agent's activity.
   - If no agent specified, load all recent activity.

2. **For Each Activity Entry, Show**:
   - **Timestamp**: When the action occurred.
   - **Agent**: Which agent performed the action.
   - **Action**: What it did (e.g., "reviewed file X", "ran build", "deployed service").
   - **Reason**: Why it did it (triggered by command, dependency, automatic).
   - **Result**: Success/failure + brief output summary.
   - **Duration**: How long the action took.
   - **Tokens**: Tokens consumed for this action.

3. **Timeline View** — Present as chronological timeline:
   ```
   [14:32:01] code-reviewer → reviewed src/api.ts — 3 findings (WARNING)
   [14:32:03] ts-reviewer → reviewed src/api.ts — 1 finding (SUGGESTION)
   [14:32:02] security-reviewer → reviewed src/api.ts — 0 findings (CLEAN)
   [14:32:05] qa-gate → validated build — PASS
   ```

4. **Summary Stats**:
   - Total actions this session: X.
   - Agents involved: list.
   - Success rate: X%.
   - Most active agent: name (X actions).
   - Total time spent: X minutes.

5. **Error Highlights** — If any actions failed:
   - Show the failed action with full error context.
   - Show what happened after the failure (retry, escalation, abort).

## Rules
- Trace is READ-ONLY — this command never modifies state.
- Show raw data — don't interpret or editorialize.
- If no trace data exists, say so clearly (don't make up activity).
- Timestamps should be in local time for readability.
