---
name: wake
description: Morning wake-up report — what happened while Mac was closed
arguments: none
---

# /wake

You have been invoked to deliver the wake-up briefing.

## Workflow

Read from the state store populated by VPS workers during downtime.

1. **Service Health** — What's the current state:
   - All services: status, uptime since last check.
   - Any services that went down and came back up (include timestamps).
   - Any services currently down — flag IMMEDIATELY at the top.

2. **Incidents** — Anything that went wrong:
   - Errors detected overnight: count and severity.
   - Auto-recovered incidents: what happened and how it was resolved.
   - Unresolved incidents: needs the user's attention NOW.

3. **New Tickets** — Support items that came in:
   - New tickets since last session: count and priorities.
   - Critical tickets: show details immediately.
   - Summary of non-critical: brief overview.

4. **Growth Metrics** — Overnight numbers:
   - New signups since last session.
   - Active users during off-hours.
   - Revenue events (if applicable).
   - Any notable spikes or drops.

5. **Alerts** — Things that need attention:
   - Security alerts from automated scans.
   - Dependency vulnerabilities discovered.
   - Certificate expiration warnings.
   - Disk space warnings.

6. **Wake-Up Report** — Present as morning briefing:
   ```
   === BUENOS DIAS ===
   Services: X/Y running (all good / Z need attention)
   Incidents: X overnight (Y resolved, Z pending)
   Tickets: X new (Y critical)
   Growth: X new users | $X revenue
   Alerts: X items need attention
   ---
   PRIORITY: [most important thing to handle first]
   ```

## Rules
- CRITICAL items go at the TOP — the user should see them first.
- Keep it concise — this is a briefing, not a novel.
- If everything is fine, say so clearly: "All quiet. No issues overnight."
- If VPS state store has no data (first run), say so and suggest running /health.
