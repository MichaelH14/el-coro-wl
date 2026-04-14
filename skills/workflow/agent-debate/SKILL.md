---
name: agent-debate
description: Use when facing an architectural decision that needs multiple perspectives, trade-off analysis, or structured evaluation before choosing an approach
---

# Agent Debate

Structured decision-making for architectural choices. Multiple agents present competing positions with evidence, then vote. Consensus drives implementation; no consensus escalates to the user.

## Preconditions

- A decision that has multiple valid approaches (architecture, tech choice, design pattern)
- At least 2 relevant agents available as debaters
- Conductor agent is orchestrating the session
- Decision is non-trivial (do not debate variable names)

## Steps

### 1. Conductor Identifies Decision

The conductor recognizes a decision point that warrants debate:
- Multiple valid implementation approaches exist
- Trade-offs are non-obvious
- Decision has lasting impact (hard to reverse later)

Frame the decision as a clear question:
```
DECISION: "Should we use WebSocket or polling for real-time updates in [project]?"
```

### 2. Select Debaters

Conductor spawns 2-4 relevant agents as teammates based on the decision domain:

- **Architecture decisions**: architect + api-designer + database-reviewer
- **Frontend decisions**: frontend-agent + ui-skill + architect
- **Performance decisions**: architect + database-reviewer + operations-agent
- **Security decisions**: security-agent + architect + api-designer

Each debater is assigned a perspective (not necessarily the one they personally favor).

### 3. Research Phase

Each debater analyzes:
- Relevant codebase sections
- Existing patterns in the project
- Sombra's profile for past decisions on similar topics
- Documentation or benchmarks as evidence

### 4. Present Arguments

Each debater presents their case in structured format:

```
AGENT: [agent-name]
POSITION: [what they recommend]

EVIDENCE:
- [code analysis finding]
- [benchmark or precedent]
- [compatibility with existing architecture]

TRADE-OFFS:
  Pros:
  - [advantage 1]
  - [advantage 2]
  Cons:
  - [disadvantage 1]
  - [disadvantage 2]

EFFORT: [rough implementation estimate]
```

Arguments are presented sequentially. No interruptions.

### 5. Rebuttal Round

Each debater gets one rebuttal:
- Address specific points from other debaters
- Provide counter-evidence if available
- Acknowledge valid points from opposing positions
- Maximum 3 sentences per rebuttal

### 6. Vote

Each debater votes with confidence level:

```
VOTE: [recommended approach]
CONFIDENCE: [high / medium / low]
REASONING: [one sentence explaining confidence level]
```

### 7. Resolve

**If consensus (>66% agree on same approach):**
- Conductor implements the winning approach
- Log decision rationale to state store
- Note dissenting opinions for future reference

**If no consensus (<66% agreement):**
- Conductor presents all options to the user
- Each agent's argument is summarized (2-3 lines each)
- Conductor adds own recommendation
- the user decides. Decision is logged and Sombra's profile updated.

### 8. Archive

Save the full debate to state store:
- Decision question
- All arguments presented
- Vote results
- Final decision and who made it
- Timestamp

This archive feeds Sombra's cortex -- future debates on similar topics can reference past decisions.

## Verification / Exit Criteria

- A clear decision was reached (either by consensus or the user)
- Decision is logged in state store with full rationale
- Implementation approach is documented
- Dissenting opinions are recorded (not discarded)
- Sombra's profile updated if the user revealed a new preference
- No agent was forced into a position -- genuine analysis, not theater
