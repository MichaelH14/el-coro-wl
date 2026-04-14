---
name: task-routing
description: Use when conductor needs to analyze an incoming request and determine which agents to dispatch or whether to delegate to Codex
---

# Task Routing

Conductor's core intelligence: analyze what's being asked and dispatch to the right agents.

## Preconditions

- Agent registry loaded (all agent .md files parsed)
- Complexity scoring model available
- Codex CLI available for delegation of simple tasks

## Steps

### 1. Analyze Request Signals

Parse the incoming request for routing signals:

| Signal | Route To |
|--------|----------|
| Feature request | planner -> architect -> tdd-guide -> full chain |
| `.sql` or migration touched | database-reviewer |
| `package.json` changed | build-resolver + security-reviewer |
| Deploy config modified | deploy-validator |
| PR ready for review | code-reviewer + ts-reviewer + security-reviewer (parallel) |
| Bug report | debugger (systematic-debugging skill) |
| "Refactor" keyword | code-reviewer + architect |
| Test request | tdd-guide |
| Documentation request | planner (outline) -> writer |

### 2. Score Complexity

Rate task complexity on 0.0 - 1.0 scale:

- **< 0.4**: Simple/boilerplate -> delegate to **Codex**
- **0.4 - 0.6**: Moderate -> Conductor decides based on context
- **> 0.6**: Complex -> Claude handles directly

Complexity factors:
- Number of files likely affected
- Cross-module dependencies
- Ambiguity in requirements
- Risk of breaking existing functionality
- Need for architectural decisions

### 3. Build Agent Chain

For multi-step tasks, define the execution order:

```json
{
  "task": "new API endpoint",
  "chain": [
    {"agent": "planner", "step": 1},
    {"agent": "architect", "step": 2},
    {"agent": "tdd-guide", "step": 3},
    {"agent": "code-reviewer", "step": 4, "parallel": ["security-reviewer"]}
  ]
}
```

### 4. Dispatch

- Sequential steps: wait for previous to complete
- Parallel steps: dispatch simultaneously, aggregate results
- If Codex delegation: format clear prompt with context and constraints

## Verification / Exit Criteria

- Every request gets routed (no request left unhandled)
- Complexity score logged with reasoning
- Agent chain defined before dispatch begins
- Codex tasks include success criteria for validation
- Routing decision logged in state store
