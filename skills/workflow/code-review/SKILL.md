---
name: code-review
description: Use when requesting a code review, receiving review feedback, or running automated quality checks before merging
---

# Code Review

Two modes: requesting a review (your code) and receiving a review (feedback on your code).

## Preconditions

- Code changes are committed or staged
- Automated checks (lint, type-check, tests) have been run
- Diff is available for review

## Steps — Requesting a Review

### 1. Prepare the Diff Summary

Before requesting review:

- Write a brief summary of what changed and why
- Highlight risky areas: "This refactors the auth middleware, pay attention to token validation"
- List files changed with brief annotation per file

### 2. Run Automated Checks First

Never waste a reviewer's time on things automation catches:

- All tests pass
- Lint clean
- Type check passes
- No debug artifacts

### 3. Submit for Review

Provide to reviewer:
- Diff summary
- Risk areas highlighted
- Context: which ticket/issue, what requirements
- Specific questions if any: "Is this the right pattern for X?"

## Steps — Receiving a Review

### 4. Read ALL Feedback

Read every comment completely before responding. Do not skim. Do not start fixing after the first comment.

### 5. Verify Each Point

For each piece of feedback:

- **Agree and valid**: implement the fix
- **Agree but low priority**: acknowledge, fix or create ticket
- **Disagree**: explain WHY with technical reasoning, don't just say "I disagree"
- **Don't understand**: ask for clarification with specific questions
- **Incorrect feedback**: verify by checking the code, then explain respectfully

**Never blindly agree.** If feedback seems wrong, check the code. Performative agreement is worse than productive disagreement.

### 6. Implement Fixes

For accepted feedback, implement in order of severity:

1. **Critical** (must fix): security issues, data loss, breaking bugs
2. **High** (should fix): logic errors, missing error handling
3. **Medium** (consider): performance, readability, maintainability
4. **Low** (optional): style, naming preferences, minor refactors

### 7. Respond to All Comments

Every review comment gets a response:

- Fixed: "Fixed in [commit hash]"
- Won't fix (with reason): "Keeping as-is because..."
- Discussed: "Good point, I went with X because..."

## Verification / Exit Criteria

- Requesting: automated checks pass before submitting, risk areas highlighted
- Receiving: every comment addressed (fixed, discussed, or explained)
- No feedback blindly accepted or blindly rejected
- All critical and high findings fixed
- Medium findings addressed or tracked
- Review cycle logged for Cortex learning
