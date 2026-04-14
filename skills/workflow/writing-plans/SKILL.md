---
name: writing-plans
description: Use when there is a spec or requirements for a multi-step task and a structured implementation plan needs to be written before coding
---

# Writing Plans

Create structured implementation plans that Conductor can execute with Agent Teams.

## Preconditions

- Brainstorming complete — approach approved by the user
- Requirements are clear enough to decompose into steps
- Agent registry is known (which agents are available)

## Steps

### 1. Decompose into Steps

Break the approved approach into discrete, executable steps. Each step must have:

```markdown
## Step N: [Clear title]
- **Agent**: [who handles this]
- **Input**: [what this step receives]
- **Output**: [what this step produces]
- **Success criteria**: [how to know it's done]
- **Estimated effort**: [time range]
```

### 2. Define Dependencies

Map step dependencies explicitly:

- Step 3 depends on Step 1 and Step 2
- Steps 4 and 5 can run in parallel
- Step 6 requires all previous steps complete

Use a simple dependency notation: `depends_on: [1, 2]`

### 3. Assign Agents

Match each step to the best agent:

- Architecture decisions -> architect
- Test writing -> tdd-guide
- Implementation -> appropriate specialist
- Review -> code-reviewer, ts-reviewer, security-reviewer
- Simple/boilerplate -> Codex delegation

### 4. Identify Parallel Work

Group independent steps that can run simultaneously. Rules:

- Steps must not touch the same files
- Steps must not have data dependencies
- Each parallel group gets isolated workspace

### 5. Risk Assessment

For each step, identify:

- **Risk level**: low / medium / high
- **What could go wrong**: specific failure modes
- **Mitigation**: fallback plan or early detection

### 6. Validate Plan Size

**Max 15 steps.** If the plan exceeds 15 steps:

- Decompose into sub-plans (phases)
- Each sub-plan is independently executable
- Define phase gates between sub-plans

### 7. Write Plan File

Save to `docs/plans/plan-YYYYMMDD-title.md` with full structure.

## Verification / Exit Criteria

- Every step has agent, input, output, and success criteria
- Dependencies are acyclic (no circular deps)
- Parallel groups verified for independence
- Plan is 15 steps or fewer (or decomposed into phases)
- Risk assessment complete for all high-risk steps
- Plan saved to docs/plans/
