---
name: auto-response
description: Use when a support ticket can be matched to a known FAQ or template response, and auto-reply confidence needs to be evaluated
---

# Auto-Response

Match incoming tickets to FAQ/known solutions and respond automatically when confidence is high enough.

## Preconditions

- FAQ/known solutions database populated in state store
- Confidence thresholds configured (0.8 auto, 0.5 draft, <0.5 escalate)
- Response templates exist per product
- Tae/WhatsApp gateway ready to send replies

## Steps

### 1. Intent Matching

Extract intent from user message:
- Keyword matching against FAQ entries
- Semantic similarity if available
- Pattern matching for common phrases

Common intents per product:
- **[Product Name]**: check_results, next_draw, how_to_play, payment_issue
- **[Product Name]**: how_to_bet, find_opponent, check_balance, game_rules
- **WhatsApp Bot**: bot_not_responding, change_settings, what_can_you_do

### 2. Confidence Routing

| Confidence | Action |
|-----------|--------|
| > 0.8 | Auto-send response immediately |
| 0.5 - 0.8 | Draft response, queue for human review |
| < 0.5 | Escalate -- do not attempt response |

Override: NEVER auto-respond to payment issues, angry users, or critical severity tickets regardless of confidence.

### 3. Template Responses

Each product has response templates:

```
[Product: [Product Name]]
Intent: check_results
Response: "Los resultados del sorteo de [draw_name] estan disponibles en [link]. El ultimo sorteo fue: [results_summary]."

Intent: next_draw
Response: "El proximo sorteo de [draw_name] es [date] a las [time]. Te avisamos cuando salgan los resultados."
```

Fill placeholders with real-time data from state store before sending.

### 4. Response Quality Rules

- Keep under 200 words
- Answer the question directly in first sentence
- Include link or action if applicable
- End with "Si necesitas mas ayuda, estoy aqui" (human handoff signal)
- Never promise something the system cannot deliver
- Never reveal internal system details

### 5. Feedback Loop

After auto-response, track:
- Did user reply again on same topic? (response insufficient)
- Did user say "gracias" or similar? (response worked)
- Feed success/failure back to improve matching

## Verification / Exit Criteria

- Auto-responses only fire at confidence > 0.8
- Payment and critical tickets never auto-responded
- Templates filled with real data (no placeholder text sent)
- Response under 200 words
- Feedback tracking active on every auto-response
