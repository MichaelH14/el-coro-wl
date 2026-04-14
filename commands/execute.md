---
name: execute
description: Execute an implementation plan step by step
arguments: "[plan-file] — path to plan markdown file (optional, uses latest plan if omitted)"
---

# /execute

You have been invoked to execute an implementation plan.

## Workflow

1. **Load Plan** — Read the specified plan file, or find the most recent plan in `plans/`.
   - If no plan exists, tell the user to run `/plan` first. Do NOT improvise.

2. **Team Assembly** — Conductor creates the Agent Team.
   - Read the plan's task list and agent assignments.
   - Spawn each required agent as a subagent.
   - Assign tasks respecting dependency order — parallel where possible, sequential where blocked.

3. **Execution Phase** — Invoke the executing-plans skill.
   - Execute tasks in dependency order.
   - At each checkpoint defined in the plan, PAUSE and verify:
     - Does the output match the expected result?
     - Do tests pass?
     - Any unexpected side effects?
   - If a checkpoint fails, STOP and report to the user before continuing.

4. **Progress Tracking** — Update the plan file as tasks complete.
   - Mark tasks as: `[ ]` pending, `[x]` done, `[!]` failed, `[~]` skipped.
   - Log which agent completed each task and any deviations from plan.

5. **Completion** — When all tasks are done:
   - Run a final verification pass (build, tests, lint).
   - Present summary: tasks completed, time taken, any deviations.
   - Suggest `/review` as next step.

## Rules
- NEVER skip checkpoints. They exist to catch problems early.
- If a task fails twice, escalate to the user instead of retrying blindly.
- Respect task dependencies — never execute a blocked task.
- Update the plan file in-place so progress is always visible.
