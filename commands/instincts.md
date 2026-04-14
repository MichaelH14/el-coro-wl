---
name: instincts
description: Show all active instincts with confidence scores
arguments: none
---

# /instincts

You have been invoked to display the current instinct inventory.

## Workflow

Read from the cortex instinct store and present all active instincts.

1. **Load Instincts** — Read all instinct files from the instincts directory.
   - Parse each instinct: name, trigger, action, confidence, domain, created date, last triggered.

2. **Group by Domain** — Organize instincts by category:
   - **Code**: Coding preferences, patterns, style.
   - **Communication**: How the user likes to be communicated with.
   - **Workflow**: Process preferences, tool usage patterns.
   - **Architecture**: Design preferences, technology choices.
   - **Operations**: Deploy, monitoring, incident response patterns.

3. **Display** — For each instinct show:
   - Name and brief description.
   - Confidence score: [====------] 0.4 (visual bar + number).
   - Times triggered / times correct.
   - Last triggered date.
   - Status: ACTIVE, LOW CONFIDENCE (< 0.3), CANDIDATE FOR RULE (>= 0.8).

4. **Rule Candidates** — Highlight instincts with confidence >= 0.8:
   - These have been consistently correct and are ready for promotion.
   - Promotion means converting to a permanent rule in the rules system.
   - List them separately with recommendation to promote.

5. **Low Confidence** — Flag instincts with confidence < 0.3:
   - These might be noise or outdated.
   - Recommend review: keep, update, or archive.

6. **Summary Stats**:
   - Total instincts: X
   - Average confidence: X
   - Rule candidates: X
   - Low confidence (needs review): X

## Rules
- Present instincts clearly — the user should understand each one at a glance.
- Never auto-promote instincts to rules — always ask the user first.
- Never auto-delete low confidence instincts — flag for review.
- Sort by confidence within each domain (highest first).
