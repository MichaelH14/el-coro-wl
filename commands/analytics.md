---
name: analytics
description: Growth analytics across all products — DAU/MAU, retention, churn, LTV
arguments: "[period] — day, week, month (default: week)"
---

# /analytics

You have been invoked to produce a cross-product analytics report.

## Workflow

1. **User Metrics** — Across all products:
   - DAU (Daily Active Users): current, trend.
   - MAU (Monthly Active Users): current, trend.
   - DAU/MAU ratio: engagement indicator (>20% is good).
   - New users vs returning users breakdown.

2. **Retention Cohorts**:
   - D1 retention: what % of users come back the next day.
   - D7 retention: what % come back after a week.
   - D30 retention: what % are still active after a month.
   - Cohort comparison: are newer cohorts retaining better or worse?
   - If retention is declining, flag as concern.

3. **Churn Analysis**:
   - Churn rate: users lost per period.
   - Churn reasons: if data available (feedback, behavior patterns).
   - At-risk users: users showing churn indicators (decreasing usage).
   - Churn prevention recommendations.

4. **Revenue / LTV** (if applicable):
   - MRR (Monthly Recurring Revenue).
   - ARPU (Average Revenue Per User).
   - LTV (Lifetime Value): estimated.
   - LTV:CAC ratio: is acquisition profitable?

5. **Per-Product Breakdown**:
   - For each active product, show key metrics.
   - Highlight best-performing and worst-performing products.
   - Cross-product user overlap (users on multiple products).

6. **Report** — Period comparison (current vs previous):
   ```
   === ANALYTICS [period] ===
   DAU: X (vs X last period, +Y%)
   MAU: X (vs X last period, +Y%)
   Retention: D1 X% | D7 X% | D30 X%
   Churn: X% (trend: stable/increasing/decreasing)
   Revenue: $X MRR | $X ARPU
   ---
   Top Product: [name] — [key metric]
   Needs Attention: [name] — [concern]
   ```

## Rules
- Always compare to previous period — absolute numbers need context.
- Flag declining trends even if absolute numbers look fine.
- If data sources are unavailable, clearly state "NO DATA" per metric.
- Recommendations should be specific: "increase D7 retention by improving onboarding step 3."
