---
name: log-analysis
description: Use when parsing application logs, investigating error patterns in PM2 output, or detecting repeated failures that need attention
---

# Log Analysis

Parse application logs to detect error patterns, repeated failures, and anomalies. Alert before they become incidents.

## Preconditions

- PM2 managing application processes
- Log files accessible (default: ~/.pm2/logs/)
- Alert channel configured (Tae/WhatsApp)

## Steps

### 1. Log Sources

Primary log locations:
```
~/.pm2/logs/app-name-out.log   # stdout
~/.pm2/logs/app-name-error.log # stderr
```

Or custom paths from ecosystem.config.js:
```
./logs/out.log
./logs/error.log
```

### 2. Parse Error Patterns

Scan error logs for:

**Critical patterns** (alert immediately):
- `ECONNREFUSED` — database or service down
- `ENOMEM` — out of memory
- `FATAL` / `PANIC` — unrecoverable errors
- `Unhandled rejection` — async error not caught
- `SIGKILL` / `SIGTERM` — process killed externally

**Warning patterns** (alert after 3 occurrences in 1 hour):
- `TimeoutError` — slow dependency
- `ECONNRESET` — connection dropped
- `429` / `rate limit` — hitting external API limits
- `WARN` with increasing frequency

**Informational** (log, do not alert):
- `deprecated` warnings
- Non-critical validation failures
- Expected retry attempts

### 3. Repeated Error Detection

Track error frequency:
```json
{
  "error_signature": "ECONNREFUSED port 5432",
  "first_seen": "timestamp",
  "last_seen": "timestamp",
  "count_1h": 15,
  "count_24h": 45,
  "trending": "increasing"
}
```

Alert thresholds:
- Same error 3+ times in 1 hour: investigate
- Same error 10+ times in 1 hour: likely incident
- Error count increasing hour over hour: degradation in progress

### 4. Log Search

Quick search commands:
```bash
# Recent errors
pm2 logs app-name --err --lines 50

# Search for specific pattern
grep -i "error\|fatal\|exception" ~/.pm2/logs/app-name-error.log | tail -20

# Errors in time range
grep "2026-03-31T12" ~/.pm2/logs/app-name-error.log
```

### 5. Log Hygiene

- Rotate logs to prevent disk fill (pm2-logrotate)
- Max 10MB per log file, keep 7 rotated files
- Never log sensitive data (passwords, tokens, PII)
- Log with timestamps always (`log_date_format` in PM2 config)
- Structured logging preferred (JSON format) for easier parsing

### 6. Alert Format

When error pattern triggers alert:
```
LOG ALERT — [SERVICE]

Patron: [error signature]
Frecuencia: [count] veces en la ultima hora
Tendencia: [increasing/stable/decreasing]
Primer error: [timestamp]
Ultimo error: [timestamp]

Ejemplo:
[most recent log line with error]

Accion sugerida: [check database / restart service / investigate]
```

## Verification / Exit Criteria

- Error logs scanned on schedule (minimum every 6 hours)
- Critical patterns trigger immediate alerts
- Repeated errors detected and tracked with frequency
- No sensitive data in logs
- Log rotation configured and working
- Alert fatigue managed (thresholds tuned, transients filtered)
