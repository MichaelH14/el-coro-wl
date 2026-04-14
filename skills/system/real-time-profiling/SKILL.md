---
name: real-time-profiling
description: Use when sombra needs to process a new observation about the user's behavior, communication patterns, or preferences
---

# Real-Time Profiling

Sombra observes every interaction and maintains a living profile of the user's preferences, patterns, and triggers.

## Preconditions

- profile.json exists at `sombra/profile.json`
- State store is accessible
- No other process holds flock on sombra/profile.json.lock

## Steps

### 1. Observe Current Interaction

Extract signals from the current message:

- **Communication patterns**: tone, length preference, language switches (ES/EN)
- **Vocabulary**: recurring terms, slang ("tt" = tato = OK), technical jargon
- **Decision patterns**: which option chosen when presented alternatives, speed of decision
- **Frustration triggers**: repeated requests, "ya te dije", corrections, ALL CAPS
- **Satisfaction triggers**: "tt", moving to next topic quickly, positive feedback

### 2. Score Confidence Per Domain

Each domain in profile.json has a confidence score (0.0 - 1.0):

- New observation from passive inference: +0.05
- Reinforced observation (seen 3+ times): +0.15
- Direct correction from the user: set to **0.95 immediately**
- Temporal decay: -0.02 per week for unreinforced observations
- Contradiction detected: drop to max(current - 0.3, 0.1) and flag for review

### 3. Acquire File Lock

```
flock -n sombra/profile.json.lock
```

If lock unavailable: queue update, retry after current operation completes. Never skip an update.

### 4. Write to profile.json

Update the relevant domain entry:

```json
{
  "domain": "communication",
  "observation": "prefers direct answers without preamble",
  "confidence": 0.92,
  "evidence_count": 14,
  "last_seen": "2026-03-31",
  "source": "direct_correction"
}
```

### 5. Release Lock

Release flock immediately after write. Log the update to `evolution.jsonl`.

## Verification / Exit Criteria

- profile.json is valid JSON after write
- Confidence scores are within [0.0, 1.0]
- No stale locks remain (lock timeout: 5 seconds)
- Update logged in evolution.jsonl with timestamp
- If confidence dropped due to contradiction: flagged in pending review
