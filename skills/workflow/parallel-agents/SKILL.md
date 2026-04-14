---
name: parallel-agents
description: Use when facing two or more independent tasks that can be worked on simultaneously without shared state or sequential dependencies
---

# Parallel Agents

Run multiple agents simultaneously on independent tasks for faster execution.

## Preconditions

- At least 2 independent tasks identified
- Tasks do not share file dependencies
- Conductor is available to orchestrate
- Agent Teams support is active

## Steps

### 1. Identify Independent Tasks

Tasks are independent when:

- They don't modify the same files
- They don't depend on each other's output
- They can be verified independently
- Order of completion doesn't matter

If tasks share ANY file: they are NOT independent. Run them sequentially.

### 2. Define File Ownership

Each teammate gets exclusive ownership of specific files:

```json
{
  "teammate_1": {
    "task": "Implement auth middleware",
    "owns": ["src/middleware/auth.ts", "src/middleware/auth.test.ts"],
    "reads": ["src/types/user.ts"]
  },
  "teammate_2": {
    "task": "Implement logging service",
    "owns": ["src/services/logger.ts", "src/services/logger.test.ts"],
    "reads": ["src/config/logging.ts"]
  }
}
```

- **owns**: exclusive write access, no other teammate touches these
- **reads**: read-only access, shared safely

### 3. Spawn Teammates

Each teammate receives:

- **Task description**: clear, unambiguous
- **Context**: relevant background, related code
- **Success criteria**: how to know the task is done
- **File ownership**: which files to create/modify
- **Deadline**: max time before Conductor intervenes

### 4. Monitor Execution

Conductor tracks all spawned teammates:

- Progress updates (started, in-progress, blocked, completed)
- If a teammate is blocked: investigate, reassign if needed
- If a teammate fails: don't block others, handle independently
- Resource monitoring: ensure background limits respected

### 5. Aggregate Results

When all teammates complete:

- Collect all results using result-aggregation skill
- Verify no file ownership violations (no two teammates modified same file)
- Run integration tests on combined work
- Build verification on merged output

### 6. Handle Conflicts

If despite file ownership, integration issues arise:

- Identify the conflict (type error, import issue, interface mismatch)
- Determine which teammate's work needs adjustment
- Dispatch fix as a sequential follow-up task

## Verification / Exit Criteria

- All teammates completed or timed out with report
- No file ownership violations
- Integration tests pass on combined work
- Build succeeds with all changes merged
- Results aggregated and organized by severity
- Total wall-clock time < sum of individual task times (parallelism achieved)
