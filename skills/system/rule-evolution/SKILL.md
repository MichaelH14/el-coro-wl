---
name: rule-evolution
description: Use when an instinct has reached high confidence and sufficient evidence to be promoted into a permanent rule
---

# Rule Evolution

Instincts that prove reliable get promoted to permanent rules — codified knowledge that guides all agents.

## Preconditions

- State store has instincts table with active instincts
- rules/ directory exists and is writable
- qa-gate agent is available for review
- At least one instinct with confidence > 0.85

## Steps

### 1. Monitor Instinct Confidence

Periodically scan the instincts table for promotion candidates:

- confidence > 0.85
- evidence_count > 10
- No contradictions in last 5 sessions
- Active for at least 7 days (not a flash pattern)

### 2. Draft Rule

Convert instinct into a rule with clear language:

```markdown
---
id: rule-NNN
source: instinct inst-20260331-001
promoted: 2026-03-31
---

# Rule: [Clear imperative statement]

## When
[Conditions under which this rule applies]

## Then
[What to do — specific, actionable]

## Why
[Evidence summary: pattern count, sessions observed, accuracy]
```

### 3. Create Rule File

Write to `rules/rule-NNN.md`. Rule IDs are sequential. Never reuse a retired rule ID.

### 4. Archive the Instinct

Update instinct status to `promoted` in state store. Keep the record — never delete instincts. Add reference to the new rule ID.

### 5. Submit to qa-gate

qa-gate reviews the new rule for:

- Clarity: is the rule unambiguous?
- Consistency: does it conflict with existing rules?
- Scope: is it too broad or too narrow?

If qa-gate rejects: revert to instinct status, add rejection reason, increase evidence threshold to 15.

## Verification / Exit Criteria

- New rule file exists in rules/ with proper frontmatter
- Instinct marked as `promoted` in state store (not deleted)
- qa-gate has reviewed and approved (or rejection is logged)
- No duplicate rules (semantic check against existing rules)
- evolution.jsonl logs the promotion event
