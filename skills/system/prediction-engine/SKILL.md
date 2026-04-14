---
name: prediction-engine
description: Use when sombra needs to generate, track, or validate predictions about the user's preferences based on observed patterns
---

# Prediction Engine

Generate, track, and validate predictions about what the user wants before he asks.

## Preconditions

- profile.json has at least 3 domains with confidence > 0.6
- predictions/pending.json exists and is writable
- predictions/history.json exists for accuracy tracking

## Steps

### 1. Evaluate Prediction Eligibility

Only generate predictions for domains where confidence > 0.6. Below that threshold, observations are too unreliable. Check:

- Domain confidence score in profile.json
- Number of evidence points (minimum 5)
- Recency of last observation (within 2 weeks)

### 2. Generate Prediction

Based on current context + profile patterns, predict:

- **Tool preference**: which tool/approach the user will prefer
- **Response format**: how he wants information presented
- **Next action**: what he'll ask for next in a workflow
- **Rejection**: what he'll reject or correct

Structure:

```json
{
  "id": "pred-20260331-001",
  "domain": "workflow",
  "prediction": "Will want TDD approach for new feature",
  "confidence": 0.72,
  "basis": ["pattern: always asks for tests first", "3 recent TDD sessions"],
  "generated": "2026-03-31T10:00:00Z",
  "status": "pending"
}
```

### 3. Track in pending.json

Append prediction to `predictions/pending.json`. Max 20 pending predictions at a time. If limit reached, expire oldest low-confidence ones first.

### 4. Validate After Session

Post-session, compare predictions against actual outcomes:

- **Correct**: prediction matched actual behavior -> boost domain confidence +0.05
- **Incorrect**: prediction was wrong -> reduce domain confidence -0.03
- **Unused**: context never arose -> move to expired, no confidence change

### 5. Calculate Accuracy Rate

Per domain, maintain rolling accuracy over last 50 predictions:

- accuracy > 80%: domain is well-understood, increase prediction aggressiveness
- accuracy 60-80%: stable, continue normal operation
- accuracy < 60%: pause predictions for this domain, gather more observations

## Verification / Exit Criteria

- All predictions have unique IDs
- No prediction generated for domains below 0.6 confidence
- Accuracy rates updated after each validation pass
- History log contains full prediction lifecycle (generated -> validated)
- Expired predictions cleaned up after 30 days
