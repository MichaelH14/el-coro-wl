---
name: escalation-rules
description: Use when deciding whether a support ticket should be escalated to a human, especially for angry customers, critical issues, data loss, or payment problems
---

# Escalation Rules

Define when and how to escalate support tickets to a human. Err on the side of escalating.

## Preconditions

- Ticket classified with severity, category, and product
- Escalation contacts defined per product/severity
- Communication channel to escalation target available (Tae/WhatsApp)

## Steps

### 1. Mandatory Escalation Triggers

ALWAYS escalate if ANY of these are true:
- Customer is angry, frustrated, or using aggressive language
- Severity is critical (service down)
- Data loss reported or suspected
- Payment related (charges, refunds, billing errors)
- Legal or compliance mention
- Same user has contacted 3+ times about same issue
- Auto-response confidence < 0.5

No exceptions. When in doubt, escalate.

### 2. Sentiment Detection

Anger/frustration signals in Spanish:
- "esto es una basura", "no sirve", "quiero mi dinero"
- "hace rato", "siempre lo mismo", "estoy harto"
- ALL CAPS messages
- Multiple exclamation/question marks (!!!, ???)
- Threatening language

If detected, escalate immediately regardless of severity classification.

### 3. Escalation Format

Every escalation must include this structured handoff:

```
ESCALATION — [SEVERITY] — [PRODUCT]

Ticket: #[id]
User: [identifier]
Time: [when they first contacted]

ISSUE SUMMARY:
[2-3 sentence summary of what the user is experiencing]

WHAT WAS TRIED:
- [Auto-response sent? What was it?]
- [Any automated fixes attempted?]
- [Previous tickets from this user?]

RECOMMENDATION:
[What the system thinks should be done next]

RAW MESSAGES:
[Full conversation history]
```

### 4. Escalation Routing

| Condition | Route To |
|-----------|----------|
| Critical / service down | the user (immediate) |
| Payment issue | the user (immediate) |
| High severity bug | the user (within 1 hour) |
| Repeated complaint (3+) | the user (within 4 hours) |
| Feature request (popular) | Backlog review queue |

### 5. Post-Escalation

After escalating:
- Send user acknowledgment: "Tu caso ha sido escalado a nuestro equipo. Te contactamos pronto."
- Log escalation in state store with full context
- Set follow-up reminder if no resolution in 24h

## Verification / Exit Criteria

- All mandatory triggers cause immediate escalation (no false negatives)
- Escalation message includes full structured handoff format
- User receives acknowledgment within 30 seconds of escalation
- State store updated with escalation record
- No payment or critical tickets handled without escalation
