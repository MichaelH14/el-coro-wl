---
name: learn
description: Force cortex to process current session and extract instincts
arguments: none
---

# /learn

You have been invoked to force the cortex to learn from the current session.

## Workflow

Trigger the `cortex` subsystem to process session data NOW (instead of waiting for automatic processing).

1. **Session Review** — Analyze the current conversation:
   - What tasks were performed?
   - What decisions were made and why?
   - What worked well? What caused friction?
   - What corrections did the user make? (These are HIGH SIGNAL.)

2. **Pattern Detection** — Look for recurring patterns:
   - Does the user prefer a certain approach when given options?
   - Are there repeated corrections? (Same mistake = missing instinct.)
   - Were there shortcuts or workflows the user used?
   - Did the user express frustration? (Strong signal for instinct creation.)

3. **Instinct Extraction** — Create or update instincts:
   - Each instinct: trigger condition, action to take, confidence score (0.0-1.0).
   - New instincts start at 0.3 confidence.
   - Existing instincts that were reinforced: increase confidence by 0.1.
   - Instincts that were contradicted: decrease confidence by 0.2.

4. **Rule Candidates** — Identify instincts ready for promotion:
   - Instincts with confidence >= 0.8 are candidates for permanent rules.
   - Present candidates to the user for approval before promoting.

5. **Report** — Show what was learned:
   - New instincts created: list with descriptions.
   - Updated instincts: list with old/new confidence.
   - Rule candidates: instincts ready for promotion.
   - Session quality: how much signal was in this session.

## Rules
- the user's corrections are the HIGHEST priority signal.
- Never create instincts from a single observation — need at least pattern consistency.
- Contradicted instincts should be flagged, not silently removed.
- Always show what was learned — transparency builds trust.
