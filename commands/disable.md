---
name: disable
description: Temporarily disable an agent — conductor skips it in routing
arguments: <agent-name> — name of the agent to disable
---

# /disable

You have been invoked to temporarily disable an agent.

## Workflow

1. **Validate** — Check the agent exists.
   - Look for the agent file in the agents directory.
   - If agent not found, list available agents and ask the user to clarify.

2. **Disable** — Flag the agent as disabled.
   - Add a `disabled: true` flag to the agent's frontmatter.
   - Do NOT delete the agent file — it's preserved for re-enabling.
   - Record the disable timestamp and reason (if provided).

3. **Conductor Update** — Notify the routing system.
   - Conductor will skip this agent when routing tasks.
   - Any tasks that would have gone to this agent will be:
     - Routed to an alternative agent (if one exists for that domain).
     - Queued for manual handling (if no alternative).

4. **Verify** — Confirm the agent is disabled.
   - Read the agent file to verify the disabled flag.
   - Check that conductor acknowledges the change.

5. **Report**:
   - Agent disabled: [name].
   - Tasks affected: what this agent normally handles.
   - Alternative routing: where those tasks will go now.
   - Re-enable command: `/enable <agent-name>`.

## Rules
- Agent file is NEVER deleted — only flagged.
- Core agents (conductor, qa-gate) CANNOT be disabled — reject the request.
- If disabling the last agent in a domain, WARN the user that domain will be unserved.
- Keep a log of disable/enable history for auditing.
