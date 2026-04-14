---
name: enable
description: Re-enable a previously disabled agent
arguments: <agent-name> — name of the agent to re-enable
---

# /enable

You have been invoked to re-enable a disabled agent.

## Workflow

1. **Validate** — Check the agent exists and is currently disabled.
   - Look for the agent file in the agents directory.
   - Verify it has `disabled: true` in frontmatter.
   - If agent is not disabled, report that it's already active.
   - If agent not found, list available agents.

2. **Enable** — Remove the disabled flag.
   - Remove or set to false the `disabled` flag in frontmatter.
   - Record the re-enable timestamp.

3. **Conductor Update** — Notify the routing system.
   - Conductor will include this agent in task routing again.
   - Any queued tasks for this agent's domain should be processed.

4. **Verify** — Confirm the agent is active.
   - Read the agent file to verify the flag is removed.
   - Check that conductor acknowledges the change.
   - Optionally: run a quick health check on the agent (can it execute a simple task?).

5. **Report**:
   - Agent re-enabled: [name].
   - Was disabled since: [date].
   - Tasks it will now handle: list of domains/responsibilities.
   - Queued tasks: any pending work that was waiting.

## Rules
- Only agents with `disabled: true` can be enabled — don't modify active agents.
- Log the enable action for audit history.
- If the agent was disabled for a reason (e.g., buggy behavior), warn the user.
- After enabling, monitor the agent's first few actions for correctness.
