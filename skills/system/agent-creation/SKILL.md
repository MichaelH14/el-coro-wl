---
name: agent-creation
description: Use when a capability gap is identified in El Coro and a new agent needs to be created to fill it
---

# Agent Creation

Create a new agent to fill an identified capability gap in El Coro.

## Preconditions

- A clear capability gap has been identified (no existing agent covers it)
- Agent registry reviewed to confirm no overlap
- Genesis has write access to agents/ directory

## Steps

### 1. Identify the Gap

Document what's missing:

- What task failed or was handled poorly?
- Which existing agents were considered and why they don't fit?
- What would this new agent do that no current agent does?

### 2. Define the Role

Write a clear, scoped role definition:

- **Name**: lowercase-kebab-case (e.g., `performance-profiler`)
- **One-line purpose**: what this agent does in one sentence
- **Scope boundaries**: what this agent does NOT do
- **Input**: what it receives
- **Output**: what it produces

### 3. Assign Model

Choose based on task complexity:

- **opus**: Complex decisions, architecture, nuanced judgment
- **sonnet**: Most work — code review, implementation, analysis
- **haiku**: Simple tasks — formatting, validation, quick checks

Default to sonnet unless there's a specific reason for opus or haiku.

### 4. Write Iron Rules

Every agent gets exactly 5 iron rules. These are inviolable:

1. Scope rule — what the agent must never do outside its role
2. Quality rule — minimum standard for its output
3. Communication rule — how it reports findings
4. Safety rule — what it must check before acting
5. Learning rule — how it feeds back to Cortex

### 5. Include Anti-Hallucination Protocol

Every agent .md must include:

```markdown
## Anti-Hallucination
- Never claim a file exists without verifying (Read/Glob)
- Never claim code works without running tests
- Never assume a dependency is installed without checking
- When uncertain, say "I need to verify" and actually verify
- Cite specific file paths and line numbers for all claims
```

### 6. Create Agent File

Write to `agents/agent-name.md` with proper frontmatter:

```yaml
---
name: agent-name
description: "Brief description with trigger examples: 'when X happens', 'if user asks Y'"
model: sonnet
color: "#HEXCODE"
---
```

### 7. Submit to qa-gate

qa-gate reviews for: clarity, no overlap with existing agents, iron rules quality, anti-hallucination present.

### 8. Log Creation

Record in state store (genesis_log table):

```json
{
  "agent": "agent-name",
  "gap_identified": "description of gap",
  "created": "2026-03-31",
  "reviewed_by": "qa-gate",
  "status": "active"
}
```

## Verification / Exit Criteria

- Agent .md file exists with complete frontmatter
- Exactly 5 iron rules defined
- Anti-hallucination protocol included
- No overlap with existing agents (qa-gate verified)
- Creation logged in genesis_log table
- Agent appears in agent registry
