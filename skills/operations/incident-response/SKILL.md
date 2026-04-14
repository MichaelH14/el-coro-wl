---
name: incident-response
description: Use when a service is down, degraded, or there is an active incident to diagnose, fix, or rollback
---

# Incident Response

When things break: detect fast, diagnose systematically, fix or rollback, then learn from it.

## Preconditions

- Monitoring active and alerting (see monitoring skill)
- Rollback capability available (previous build, database backup)
- Communication channel to the user (Tae/WhatsApp)

## Steps

### 1. DETECT

How incidents are detected:
- Automated health check fails (monitoring skill)
- User reports via support (WhatsApp/Tae)
- PM2 shows process in "errored" state
- Error rate spike in logs

First action on detection:
- Timestamp the start: `incident_started: "2026-03-31T12:00:00Z"`
- Classify severity: critical (service down), high (feature broken), medium (degraded)
- Notify the user if critical or high

### 2. DIAGNOSE

Systematic investigation (do NOT guess):

```bash
# 1. Is the process running?
pm2 status

# 2. What do the logs say?
pm2 logs app-name --lines 100

# 3. Is the port accessible?
curl -f http://localhost:PORT/health

# 4. Is the database up?
psql -c "SELECT 1;"

# 5. Is memory/CPU exhausted?
free -m && top -bn1 | head -5

# 6. What changed recently?
git log --oneline -5
```

Work through these in order. Stop when you find the cause.

### 3. FIX or ROLLBACK

Decision: fix forward or rollback?

**Fix forward** when:
- Root cause is clear and fix is simple (< 5 minutes)
- Fix does not require deploy (config change, restart)

**Rollback** when:
- Root cause unclear
- Fix is complex or risky
- Users are actively impacted (speed > perfection)

Rollback procedure:
1. `pm2 stop app-name`
2. Restore previous build: `git checkout previous-tag` or restore from backup
3. `npm ci && npm run build`
4. `pm2 restart app-name`
5. Verify health check passes

### 4. COMMUNICATE

During incident:
- Acknowledge to affected users: "Estamos trabajando en el problema"
- Update every 30 minutes if ongoing
- Announce resolution: "El servicio ha sido restaurado"

### 5. POST-MORTEM

Within 24 hours of resolution, document:

```
INCIDENT POST-MORTEM

Date: [date]
Duration: [start to resolution]
Severity: [critical/high/medium]
Service: [affected service]

TIMELINE:
- [time] Issue detected by [monitoring/user report]
- [time] Investigation started
- [time] Root cause identified: [what]
- [time] Fix deployed / rollback executed
- [time] Service restored

ROOT CAUSE:
[What actually broke and why]

CONTRIBUTING FACTORS:
[What made it possible for this to happen]

ACTION ITEMS:
- [ ] [Prevent this specific issue]
- [ ] [Improve detection for this class of issue]
- [ ] [Add test/monitoring to catch earlier]
```

No blame. Focus on systems, not people.

## Verification / Exit Criteria

- Incident detected within monitoring interval
- Diagnosis followed systematic checklist (not guessing)
- Service restored (fix or rollback) within severity SLA
- Users communicated to during and after incident
- Post-mortem written within 24 hours
- Action items tracked to completion
