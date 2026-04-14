---
name: scheduled-tasks
description: Use when creating, reviewing, or managing cron jobs and scheduled tasks across the system
---

# Scheduled Tasks

Master registry of all scheduled/recurring tasks. Every cron job documented, monitored, and maintained.

## Preconditions

- Scheduling mechanism available (cron, PM2 cron, or application-level scheduler)
- Tasks implemented and tested
- Monitoring active to detect missed executions

## Steps

### 1. Task Registry

All scheduled tasks in one place:

| Task | Schedule | Duration | Critical? |
|------|----------|----------|-----------|
| Health checks | Every 6 hours | < 30s | Yes |
| Security scan | Nightly (2 AM) | < 5 min | Yes |
| Instinct evolution | Weekly (Sunday 3 AM) | < 10 min | No |
| E2E smoke tests | Post-deploy | < 5 min | Yes |
| Database backup | Daily (1 AM) | < 15 min | Yes |
| Log rotation | Daily (4 AM) | < 1 min | No |
| Dependency audit | Weekly (Monday 8 AM) | < 2 min | No |
| Growth metrics report | Weekly (Monday 9 AM) | < 1 min | No |
| Backup verification | Monthly (1st, 5 AM) | < 10 min | Yes |

### 2. Cron Configuration

```bash
# System crontab
0 */6 * * * /path/to/health-check.sh
0 2 * * * /path/to/security-scan.sh
0 3 * * 0 /path/to/instinct-evolution.sh
0 1 * * * /path/to/backup.sh
0 4 * * * /usr/bin/pm2 flush && /usr/bin/pm2 logrotate
```

Or PM2 cron_restart:
```javascript
{
  cron_restart: '0 */6 * * *',  // for periodic tasks
}
```

### 3. Execution Logging

Every task execution logged:
```json
{
  "task": "health-check",
  "started_at": "2026-03-31T12:00:00Z",
  "completed_at": "2026-03-31T12:00:15Z",
  "duration_ms": 15000,
  "status": "success|failure",
  "output_summary": "All 5 services healthy",
  "errors": []
}
```

### 4. Missed Execution Detection

Monitor that tasks actually run:
- Compare expected schedule vs actual execution log
- If a task misses its window by > 2x its interval: alert
- Common causes: server restarted, cron daemon down, script error

### 5. Task Dependencies

Some tasks depend on others:
- E2E tests run AFTER deploy completes (not on schedule)
- Growth report runs AFTER metrics collection
- Backup verification runs AFTER backup completes

Document dependencies. Never schedule dependent tasks at the same time.

### 6. Maintenance

Monthly review:
- Are all tasks still running? (check execution logs)
- Any tasks consistently failing? (fix or remove)
- Any tasks taking longer than expected? (optimize or increase timeout)
- Any new tasks needed? (add to registry)

## Verification / Exit Criteria

- All scheduled tasks listed in single registry
- Cron entries match registry (no undocumented tasks)
- Execution logged for every task run
- Missed executions detected and alerted
- Task dependencies documented and respected
- Monthly review conducted
