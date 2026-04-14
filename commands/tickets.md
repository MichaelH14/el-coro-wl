---
name: tickets
description: List support tickets with filters
arguments: "[filter] — open, closed, critical, product:<name>, recent (default: open)"
---

# /tickets

You have been invoked to list support tickets.

## Workflow

1. **Parse Filter** — Determine what to show:
   - **open** (default): All currently open tickets.
   - **closed**: Recently closed tickets (last 7 days).
   - **critical**: Only critical/high priority tickets.
   - **product:<name>**: Tickets for a specific product (e.g., product:product-name).
   - **recent**: Last 20 tickets regardless of status.
   - Filters can be combined: "critical product:product-name".

2. **Load Tickets** — Read from support ticket store.
   - Apply the specified filter(s).
   - Sort by severity (critical first), then by age (oldest first).

3. **Display** — For each ticket show:
   ```
   #ID | PRIORITY | STATUS    | PRODUCT  | SUBJECT              | AGE
   042 | CRITICAL | open      | [Product Name]  | Payment not processed | 2h
   039 | HIGH     | progress  | Lottery  | Wrong result shown    | 1d
   041 | MEDIUM   | waiting   | [Service Name]   | Dashboard slow        | 3h
   ```

4. **Summary** — After the list:
   - Total tickets matching filter: X.
   - Critical: X. High: X. Medium: X. Low: X.
   - Average age of open tickets.
   - Tickets approaching SLA breach.

5. **Quick Actions** — Suggest next steps:
   - For critical tickets: suggest immediate investigation.
   - For old tickets: suggest follow-up or closure.
   - For recurring topics: suggest creating documentation.

## Rules
- Default sort is always severity first, then age.
- CRITICAL tickets are always highlighted/flagged.
- If no tickets match the filter, say so (don't show empty table).
- Limit display to 50 tickets — suggest narrowing filter if more exist.
