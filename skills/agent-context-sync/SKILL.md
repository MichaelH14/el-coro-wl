---
name: agent-context-sync
description: Use when cortex has learned something relevant to a specific agent and needs to propagate that knowledge into the agent's definition file
---

# Agent Context Sync

When Cortex learns something relevant to a specific agent, that knowledge flows into the agent's definition file.

## Preconditions

- Cortex has new knowledge (instinct or validated pattern) relevant to a specific agent
- Agent .md file exists in agents/ directory
- evolution.jsonl is writable for versioning

## Steps

### 1. Identify Relevant Agent

Match new knowledge to agents by domain:

- Code quality finding -> code-reviewer, ts-reviewer
- Security pattern -> security-reviewer
- Deploy behavior -> deploy-validator
- Database pattern -> database-reviewer
- Architecture decision -> architect
- Test pattern -> tdd-guide

If knowledge spans multiple agents, update each one.

### 2. Prepare Context Entry

Format the new knowledge as a context entry:

```markdown
### [Date] - [Brief title]
- **Source**: instinct inst-XXX / pattern pat-XXX
- **Context**: [What was learned]
- **Implication**: [How this affects the agent's work]
```

### 3. Append to Learned Context Section

Locate or create the `## Learned Context` section at the **bottom** of the agent's .md file. Append the new entry.

**Iron rules**:
- NEVER modify anything above the Learned Context section
- NEVER change iron rules, core instructions, or agent personality
- ONLY append — never edit or remove existing learned context
- Keep entries concise (3-5 lines max each)

### 4. Version the Change

Log to evolution.jsonl:

```json
{
  "type": "agent_context_update",
  "agent": "code-reviewer",
  "knowledge_source": "inst-20260331-001",
  "timestamp": "2026-03-31T10:00:00Z",
  "summary": "Added TS strict mode preference"
}
```

## Verification / Exit Criteria

- Agent .md file has Learned Context section with new entry
- No content above Learned Context was modified (diff check)
- Iron rules section is byte-identical before and after
- Change logged in evolution.jsonl
- Agent .md is valid markdown after update
