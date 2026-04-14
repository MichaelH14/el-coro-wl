---
name: growth-analytics
description: Use when the user asks about growth metrics, user analytics, retention, churn, LTV, CAC, or product performance data
---

# Growth Analytics

Track, compute, and report on growth metrics. Data source: state store `growth_metrics` table.

## Preconditions

- State store accessible with `growth_metrics` table populated
- Event tracking in place (signups, logins, actions, churns)
- At least 7 days of data for meaningful trends

## Steps

### 1. Core Metrics

Compute daily:

- **DAU** (Daily Active Users): unique users with at least 1 action today
- **MAU** (Monthly Active Users): unique users with at least 1 action in last 30 days
- **DAU/MAU ratio**: stickiness indicator (target > 0.2)
- **New users**: first-time signups today
- **Activation rate**: new users who complete key action within 24h

### 2. Retention Curves

Cohort-based retention:

```
Cohort: users who signed up in week W
Day 1:  % still active day after signup
Day 7:  % still active 7 days after signup
Day 14: % still active 14 days after signup
Day 30: % still active 30 days after signup
```

Flag if Day 7 retention drops below 20% -- indicates onboarding problem.

### 3. Churn Rate

Monthly churn = users who were active last month but not this month / total active last month.

- Healthy churn: < 5% monthly for consumer products
- Alert threshold: > 10% monthly
- Break down by product and user segment

### 4. LTV and CAC

- **LTV** (Lifetime Value): average revenue per user * average lifespan in months
- **CAC** (Customer Acquisition Cost): total spend on acquisition / new users acquired
- **LTV:CAC ratio**: must be > 3:1 to be sustainable
- If ratio < 3:1, flag for immediate review of acquisition channels

### 5. Weekly Report

Generate every Monday:

```
Week of [date]:
- DAU: X (trend: +/-Y%)
- MAU: X (trend: +/-Y%)
- New signups: X
- Activation rate: X%
- Day-7 retention (last cohort): X%
- Churn rate (rolling 30d): X%
- LTV:CAC ratio: X:1
- Top concern: [auto-detected from metrics]
```

## Verification / Exit Criteria

- All 5 core metrics computed and stored daily
- Retention curves generated per weekly cohort
- Churn rate broken down by product
- Weekly report generated automatically
- Alerts fire when metrics cross threshold boundaries
