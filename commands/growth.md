---
name: growth
description: Growth dashboard — metrics, campaigns, A/B tests, recommendations
arguments: "[product] — filter to specific product (optional, shows all if omitted)"
---

# /growth

You have been invoked to display the growth dashboard.

## Workflow

1. **Current Metrics** — Pull key growth numbers:
   - DAU (Daily Active Users) / MAU (Monthly Active Users).
   - New signups: today, this week, this month.
   - Retention rate: D1, D7, D30.
   - Churn rate: users leaving per period.
   - Revenue (if applicable): MRR, ARPU.
   - If product specified, filter all metrics to that product.

2. **Active Campaigns** — List running growth initiatives:
   - Campaign name, type (acquisition, retention, activation).
   - Start date, target audience, current results.
   - Performance vs goal: on track, behind, ahead.

3. **A/B Tests** — Show active experiments:
   - Test name, hypothesis, variants.
   - Sample size: current vs required for significance.
   - Preliminary results (with confidence intervals if enough data).
   - Estimated time to statistical significance.

4. **Funnel Analysis** — Key conversion funnels:
   - Signup funnel: visit → signup → activation → retention.
   - Drop-off points: where users are leaving.
   - Compared to previous period: improving or degrading.

5. **Recommendations** — AI-driven growth suggestions:
   - Based on current metrics, suggest 3 high-impact actions.
   - Based on funnel drop-offs, suggest fixes.
   - Based on user behavior patterns, suggest features or experiments.

6. **Dashboard Output**:
   ```
   === GROWTH DASHBOARD ===
   [Product: All / specific]
   DAU: X (+Y% WoW) | MAU: X
   Signups: X today | X this week
   Retention: D1 X% | D7 X% | D30 X%
   Campaigns: X active | X on track
   A/B Tests: X running | X need attention
   Top Recommendation: [one-liner]
   ```

## Rules
- Use real data from analytics sources — never fabricate metrics.
- If data source is unavailable, say "NO DATA" for that metric.
- Recommendations should be specific and actionable, not generic.
- Always show trends (WoW, MoM) — absolute numbers without context are useless.
