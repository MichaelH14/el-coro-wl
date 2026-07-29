---
name: continuous-learning
description: Use when cortex needs to extract patterns from the current session and create or update instincts based on repeated behaviors
---

# Continuous Learning

Cortex observes tool usage and workflow patterns during sessions, detects repetition, and crystallizes patterns into instincts.

## Preconditions

- State store is accessible (instincts table exists)
- Active session with observable tool usage
- Cortex has read access to session history

## Steps

### 1. Observe Tool Usage Patterns

During each session, track:

- Which tools are invoked and in what order
- File types touched and their groupings
- Commands run before/after certain operations
- Corrections the user makes to outputs
- Shortcuts or patterns the user explicitly teaches

### 2. Detect Repeated Patterns

A pattern is detected when the same sequence occurs **3+ times**:

- Same tool chain in same order (e.g., Read -> Edit -> Bash test)
- Same correction applied to similar outputs
- Same file structure chosen for similar features
- Same rejection of a particular approach

Pattern structure:

```json
{
  "pattern_id": "pat-20260331-001",
  "type": "tool_chain",
  "sequence": ["Read", "Edit", "Bash:test"],
  "occurrences": 4,
  "first_seen": "2026-03-15",
  "last_seen": "2026-03-31",
  "context": "editing TypeScript files"
}
```

### 3. Create Instinct

When pattern threshold is met, create an instinct:

```json
{
  "instinct_id": "inst-20260331-001",
  "from_pattern": "pat-20260331-001",
  "description": "After editing TS files, always run tests before committing",
  "confidence": 0.6,
  "evidence_count": 4,
  "status": "active",
  "created": "2026-03-31"
}
```

Initial confidence: 0.6 (just above activation threshold).

### 4. Store in State Store

Insert into `instincts` table in state store. Fields: instinct_id, description, confidence, evidence_count, status, created, last_reinforced.

### 5. Rate Limit

**Max 5 new instincts per session.** If more patterns detected, queue the strongest (most occurrences) and defer the rest. This prevents noisy sessions from flooding the instinct store.

## Verification / Exit Criteria

- Each instinct traces back to a specific pattern with 3+ occurrences
- No more than 5 instincts created in a single session
- All instincts stored in state store with complete metadata
- Duplicate detection: no instinct created if semantically identical one exists
- Instinct logged in evolution.jsonl
