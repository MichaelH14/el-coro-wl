---
name: support
description: Support dashboard — tickets, metrics, recurring issues, satisfaction
arguments: none
---

# /support

You have been invoked to display the support dashboard.

## Workflow

1. **Ticket Overview**:
   - Total open tickets: count.
   - By priority: critical, high, medium, low.
   - By status: new, in progress, waiting on customer, resolved.
   - Oldest unresolved ticket: age and details.

2. **Performance Metrics**:
   - Average first response time.
   - Average resolution time.
   - Resolution rate: % of tickets resolved within SLA.
   - Tickets per day: current vs average.

3. **Recurring Issues** — Pattern detection:
   - Group tickets by similar topic/error.
   - Identify the top 3 recurring issues.
   - For each: frequency, affected users, is there a known fix?
   - Recommend: fix root cause, create KB article, or add to FAQ.

4. **Satisfaction Score**:
   - CSAT (Customer Satisfaction): current score.
   - NPS (Net Promoter Score): if available.
   - Recent negative feedback: summarize themes.
   - Trend: improving, stable, declining.

5. **Escalated Items** — Tickets needing special attention:
   - Tickets escalated to engineering.
   - Tickets with VIP or high-value customers.
   - Tickets that have been open too long (past SLA).

6. **Dashboard Output**:
   ```
   === SUPPORT DASHBOARD ===
   Open: X tickets (Y critical)
   Avg Response: Xh | Avg Resolution: Xh
   Resolution Rate: X%
   CSAT: X/5
   ---
   Recurring: [top issue] — X tickets
   Escalated: X items need attention
   Oldest Open: [ticket] — X days
   ```

## Rules
- Critical tickets are ALWAYS shown first.
- Recurring issues with 3+ occurrences should be flagged for root cause fix.
- If support data source is unavailable, state clearly.
- Focus on actionable insights, not just numbers.
