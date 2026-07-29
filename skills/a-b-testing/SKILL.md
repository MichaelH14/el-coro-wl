---
name: a-b-testing
description: Use when setting up an A/B test, defining experiment hypotheses, choosing success metrics, or analyzing test results for statistical significance
---

# A/B Testing

Structured experimentation: hypothesis-driven, statistically valid, documented.

## Preconditions

- Feature flagging system available (or simple random assignment)
- Event tracking for the metric being tested
- Enough traffic to reach significance within 2 weeks

## Steps

### 1. Define Hypothesis

Format: "If we [change], then [metric] will [improve/decrease] by [amount] because [reason]."

Example: "If we show lottery results as a card grid instead of a list, then click-through rate will increase by 15% because visual scanning is faster."

Reject vague hypotheses. "Make it better" is not testable.

### 2. Design Variants

- **Control (A)**: current experience, unchanged
- **Variant (B)**: single change being tested
- Only change ONE thing per test (isolate the variable)
- If testing multiple changes, run sequential tests, not multivariate

### 3. Define Success Metric

- **Primary metric**: the one metric that determines winner (e.g., CTR, conversion, retention)
- **Guardrail metrics**: metrics that must NOT degrade (e.g., page load time, error rate)
- Define "success" numerically before starting (e.g., +10% CTR with p < 0.05)

### 4. Sample Size and Duration

Minimum sample per variant:
- For detecting 10% lift: ~400 samples per variant
- For detecting 5% lift: ~1600 samples per variant
- Never call a test early -- run for full planned duration

Duration: minimum 7 days (capture weekly patterns), maximum 30 days.

### 5. Run and Monitor

- Random assignment: 50/50 split
- No peeking at results before planned end date
- Monitor guardrail metrics only during test
- If guardrail metric degrades significantly, kill test early

### 6. Analyze Results

- Calculate statistical significance (p-value < 0.05)
- If significant: implement winner, document learning
- If not significant: no winner, document that too (null result is a result)
- Record confidence interval, not just point estimate

### 7. Document Result

```json
{
  "test_name": "results-card-grid",
  "hypothesis": "Card grid increases CTR by 15%",
  "result": "winner_b|winner_a|inconclusive",
  "primary_metric_lift": "+12%",
  "p_value": 0.03,
  "sample_size": 850,
  "duration_days": 14,
  "learning": "Visual layouts outperform lists for result browsing"
}
```

## Verification / Exit Criteria

- Hypothesis documented before test starts
- Only one variable changed between control and variant
- Test ran for planned full duration
- Statistical significance calculated (not eyeballed)
- Result documented regardless of outcome
- Guardrail metrics checked and unharmed
