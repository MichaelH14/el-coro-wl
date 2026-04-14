---
name: customer-support-automation
description: Use when handling customer support requests, complaints, or questions from product users received via Tae or WhatsApp
---

# Customer Support Automation

End-to-end support pipeline: intake, classify, resolve or escalate. Every interaction logged.

## Preconditions

- Tae/WhatsApp gateway active and receiving messages
- Known solutions database populated in state store
- Escalation contacts defined per product
- State store `support_tickets` table available

## Steps

### 1. Receive Ticket

Intake sources:
- WhatsApp message via Tae (primary)
- Direct API call (internal tools)

Extract from message:
- User identifier (phone number / user ID)
- Raw message text
- Timestamp
- Media attachments (screenshots, etc.)

### 2. Classify Ticket

Assign three dimensions:

**Severity**: critical | high | medium | low (see ticket-triage skill)

**Category**: bug | feature_request | question | complaint | payment

**Product**: lottery_bot | product-name | kaon | unknown

Log classification to state store immediately.

### 3. Search Known Solutions

Query state store for matching past resolutions:
- Match by category + product
- Fuzzy match on message content keywords
- Return top 3 matches with confidence scores

### 4. Respond or Escalate

Decision tree based on confidence:
- **Confidence > 0.8**: auto-send response (see auto-response skill)
- **Confidence 0.5-0.8**: draft response for human review
- **Confidence < 0.5**: escalate immediately (see escalation-rules skill)

### 5. Log and Close

Every ticket gets a state store entry:
```json
{
  "ticket_id": "auto-generated",
  "user_id": "phone or id",
  "product": "lottery_bot",
  "category": "bug",
  "severity": "medium",
  "message": "original text",
  "resolution": "auto|draft|escalated",
  "response_sent": "response text or null",
  "resolved_at": "timestamp or null",
  "escalated_to": "name or null"
}
```

## Verification / Exit Criteria

- Every incoming message gets classified within 5 seconds
- Known solution match rate tracked (target > 60%)
- No critical or payment tickets auto-responded (always escalate)
- All tickets logged to state store with full context
- Escalated tickets include summary + attempted solutions
