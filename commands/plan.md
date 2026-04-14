---
name: plan
description: Brainstorm + design + create implementation plan
arguments: <description> — what you want to build or solve
---

# /plan

You have been invoked to create an implementation plan.

## Workflow

1. **Brainstorm Phase** — Invoke the brainstorming skill FIRST.
   - Explore the user's intent, constraints, and edge cases.
   - Generate at least 3 approaches with trade-offs.
   - Do NOT skip this step — jumping to planning without brainstorming produces shallow plans.

2. **Architecture Phase** — Dispatch `planner` and `architect` agents.
   - `planner`: Break the description into discrete, testable tasks with dependencies.
   - `architect`: Validate technical feasibility, identify risks, define system boundaries.
   - Both agents work in parallel. Conductor merges their outputs.

3. **Plan Writing Phase** — Invoke the writing-plans skill.
   - Structure the plan as a markdown file with:
     - **Goal**: One sentence.
     - **Tasks**: Numbered, with dependencies noted (e.g., "blocked by #2").
     - **Agents**: Which agent handles each task.
     - **Checkpoints**: Where to pause and verify before continuing.
     - **Risks**: What could go wrong and mitigation.
   - Save the plan to `plans/` directory with a descriptive filename.

4. **Output** — Present the plan summary to the user.
   - Show task count, estimated complexity, and recommended execution order.
   - Ask: "Ready to /execute this plan?"

## Rules
- Every task in the plan MUST be independently verifiable.
- No task should take more than 30 minutes of agent work.
- If the description is vague, brainstorming phase MUST clarify before planning.
- Plans are living documents — they can be revised with `/plan` again.
