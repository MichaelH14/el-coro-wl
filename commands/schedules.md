---
name: schedules
description: List all active scheduled tasks with next run time and last result
arguments: none
---

# /schedules

You have been invoked to display all scheduled tasks.

## Workflow

1. **Load Schedules** — Read from the scheduler configuration:
   - Health checks (automated /health runs).
   - Security scans (automated /security runs).
   - Instinct reports (cortex automatic learning cycles).
   - Backup schedules (automated /backup runs).
   - Custom cron jobs defined in the project.
   - PM2 cron restarts if configured.

2. **Display** — For each scheduled task show:
   ```
   TASK                | SCHEDULE        | NEXT RUN          | LAST RUN          | LAST RESULT
   Health Check        | every 5min      | 14:35:00          | 14:30:00          | PASS
   Security Scan       | daily 03:00     | 2026-04-01 03:00  | 2026-03-31 03:00  | 2 findings
   Instinct Report     | every 6h        | 18:00:00          | 12:00:00          | 3 new instincts
   DB Backup           | daily 02:00     | 2026-04-01 02:00  | 2026-03-31 02:00  | OK (45MB)
   PM2 Restart (Tae)   | weekly Sun 04:00| 2026-04-06 04:00  | 2026-03-30 04:00  | OK
   ```

3. **Status Indicators**:
   - PASS / OK: Last run succeeded.
   - WARN: Last run had non-critical issues.
   - FAIL: Last run failed — needs attention.
   - OVERDUE: Task didn't run at its scheduled time.

4. **Alerts** — Flag issues:
   - Any task with FAIL status.
   - Any OVERDUE tasks.
   - Tasks that have been failing repeatedly.
   - Schedules that might conflict (overlapping resource-intensive tasks).

5. **Summary**:
   - Total scheduled tasks: X.
   - All healthy: X. Needs attention: X. Failed: X.
   - Next task to run: [name] at [time].

## Rules
- Show times in local timezone.
- FAILED tasks are shown at the top, always.
- If a task is OVERDUE by more than 2x its interval, flag as critical.
- If no schedules are configured, say so and suggest setting some up.
