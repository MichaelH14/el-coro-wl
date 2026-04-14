---
name: executing-plans
description: Use when there is a written implementation plan ready to execute, with tasks to dispatch to agents
---

# Executing Plans

Run a written plan through Conductor's Agent Teams orchestration.

## Preconditions

- Plan file exists in docs/plans/ and has been reviewed
- All agents referenced in the plan are available
- Working directory is clean (no uncommitted changes)
- Tests pass before starting execution

## Steps

### 1. Load Plan

Read the plan file from docs/plans/. Parse:

- Step list with dependencies
- Agent assignments
- Parallel groups
- Success criteria per step

### 2. Pre-Execution Check

Before starting:

- Verify all referenced files exist
- Verify all tools/dependencies are installed
- Run existing tests to establish baseline
- Create a checkpoint (git commit or stash) for rollback

### 3. Spawn Agents Per Plan

Conductor dispatches agents according to the plan:

- Sequential steps: one at a time, wait for completion
- Parallel steps: dispatch group simultaneously
- Each agent receives: task description, context, success criteria

### 4. Monitor Progress

For each step:

- Track start time, agent, status
- If step succeeds: check success criteria, proceed to dependents
- If step fails: pause dependent steps, engage debugger

### 5. Handle Failures

When a step fails:

- **Debugger investigates**: uses systematic-debugging skill
- **Max 3 retries** per step
- After 3 failures: pause plan, report to the user with findings
- Never silently skip a failing step

### 6. Checkpoint After Phases

After each major phase (or every 5 steps):

- Run tests
- Commit working state
- Update plan status in docs/plans/
- Report progress to the user (brief summary)

### 7. Final Review

After all steps complete:

- qa-gate reviews the complete work
- Full test suite runs
- Build verification
- Diff review against original plan

## Verification / Exit Criteria

- All plan steps completed or explicitly paused with reason
- Tests pass after execution
- Build succeeds
- No step was silently skipped
- Plan status updated (completed / paused at step N)
- Checkpoints exist for rollback if needed
