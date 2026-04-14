---
name: ticket-triage
description: Use when a new support ticket needs to be classified by severity, category, and product assignment
---

# Ticket Triage

Classify incoming support tickets by severity, category, and product. Fast, consistent, documented.

## Preconditions

- Raw ticket message available
- Product list known: [Product Name], [Product Name], WhatsApp Bot
- Severity definitions agreed upon

## Steps

### 1. Severity Classification

| Severity | Definition | Response Target |
|----------|-----------|-----------------|
| **Critical** | Service completely down, data loss, payment failure | Immediate |
| **High** | Core feature broken, affecting multiple users | < 1 hour |
| **Medium** | Cosmetic issue, non-core feature broken, workaround exists | < 24 hours |
| **Low** | Question, feature request, minor inconvenience | < 48 hours |

Auto-escalate to critical if message contains: "no funciona nada", "perdi datos", "me cobraron", "esta caido", "no carga".

### 2. Category Assignment

- **Bug**: something worked before and now does not
- **Feature request**: user wants something that does not exist
- **Question**: user needs help understanding existing functionality
- **Complaint**: user is unhappy with experience (may overlap with bug)
- **Payment**: anything involving money, charges, refunds

A ticket can have one primary category. If ambiguous, default to bug (safer to investigate).

### 3. Product Identification

Match by keywords and context:
- **[Product Name]**: loteria, sorteo, numeros, resultados, premio
- **[Product Name]**: ajedrez, partida, apuesta, rating, torneo
- **WhatsApp Bot**: bot, whatsapp, mensaje, respuesta, asistente

If product unclear from message, check user's history in state store for their most-used product.

### 4. Priority Score

Combine severity + category for queue ordering:
```
Priority = severity_weight * 10 + category_weight

severity_weight: critical=4, high=3, medium=2, low=1
category_weight: payment=5, bug=4, complaint=3, question=2, feature_request=1
```

Higher score = handle first.

## Verification / Exit Criteria

- Every ticket has exactly one severity, one category, one product
- Critical tickets are never mis-classified as lower severity
- Payment tickets always flagged regardless of perceived severity
- Priority score computed and attached to ticket
- Classification logged to state store for analytics
