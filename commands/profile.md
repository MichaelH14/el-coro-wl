---
name: profile
description: Show what sombra knows about the user — personality profile audit
arguments: none
---

# /profile

You have been invoked to display the sombra personality profile.

## Workflow

Read from the `sombra` subsystem's profile store and present a full audit.

1. **Core Profile** — Display top-level traits:
   - Communication style: how the user prefers to interact.
   - Decision-making patterns: fast/deliberate, data-driven/intuition.
   - Work patterns: when productive, what triggers flow state.
   - Technical preferences: languages, frameworks, tools, paradigms.
   - Pet peeves: things that frustrate the user (HIGH VALUE data).

2. **Domain Confidence** — For each knowledge domain, show:
   - Domain name (e.g., "React preferences", "deploy workflow").
   - Confidence level: LOW (< 5 observations), MEDIUM (5-20), HIGH (20+).
   - Number of observations backing the assessment.
   - Last updated date.

3. **Observation Log** — Recent observations (last 10):
   - What was observed, when, and what instinct or profile update it triggered.
   - This shows the user the raw data behind the profile.

4. **Prediction Accuracy** — If predictions have been made:
   - Total predictions attempted.
   - Correct predictions (the user's choice matched the prediction).
   - Accuracy percentage.
   - Domains where accuracy is highest/lowest.

5. **Gaps** — What sombra does NOT know well:
   - Domains with fewer than 5 observations.
   - Areas where predictions have been wrong.
   - Suggest how to fill gaps (e.g., "more architecture sessions would improve design preference predictions").

6. **Full Profile Summary** — Concise paragraph describing the user's working style as sombra understands it.

## Rules
- This is an AUDIT — be transparent about what's known and not known.
- Show confidence levels honestly — don't overstate what's known from few observations.
- This data belongs to the user — present it like a report he requested, not a secret dossier.
- If sombra has no data yet, say so clearly and suggest how to start building the profile.
