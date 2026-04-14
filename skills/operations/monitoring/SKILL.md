---
name: monitoring
description: Use when checking service health, setting up uptime monitoring, configuring health check endpoints, or investigating PM2 process status
---

# Monitoring

Continuous service health monitoring. Detect issues before users report them. Alert via Tae/WhatsApp.

## Preconditions

- Services running and accessible (local or VPS)
- Tae/WhatsApp gateway active for alerts
- Health check endpoints implemented on all services
- PM2 managing processes on VPS

## Steps

### 1. Health Checks

Every service exposes `/health` returning:
```json
{
  "status": "ok",
  "uptime_seconds": 3600,
  "version": "1.0.0",
  "checks": {
    "database": "ok",
    "external_api": "ok"
  }
}
```

Check interval: every 6 hours (configurable per service).

### 2. Ping Services

For each monitored service:
```bash
curl -sf -o /dev/null -w "%{http_code}" http://localhost:PORT/health
```

- HTTP 200: healthy
- HTTP 5xx: service error, investigate
- Timeout (> 10s): service unresponsive
- Connection refused: service down

### 3. PM2 Status Check

```bash
pm2 jlist  # JSON output of all processes
```

Check for each process:
- Status must be "online" (not "errored", "stopped", "launching")
- Restart count should not be climbing (crash loop detection)
- Memory within expected bounds
- CPU not sustained > 80%

### 4. Uptime Tracking

Log health check results to state store:
```json
{
  "service": "product-name",
  "checked_at": "timestamp",
  "status": "healthy|degraded|down",
  "response_time_ms": 45,
  "details": {}
}
```

Calculate uptime percentage: (healthy checks / total checks) * 100.
Target: 99.5% uptime per service.

### 5. Alerting via Tae

When issue detected, send alert to the user via Tae/WhatsApp:

```
ALERTA [SEVERITY] — [SERVICE]

Estado: [down/degraded]
Desde: [timestamp]
Detalle: [error message or status code]
Accion sugerida: [what to check first]
```

Alert rules:
- Service down: alert immediately
- Service degraded (slow but responding): alert after 2 consecutive failures
- High memory: alert when > 80% of max_memory_restart threshold
- Crash loop: alert when restart count increases > 3 in 10 minutes

Do NOT alert for:
- Single transient failure followed by recovery
- Planned maintenance windows

## Verification / Exit Criteria

- All services have /health endpoint
- Health checks run on configured interval
- PM2 status monitored for crash loops and memory
- Uptime tracked and logged per service
- Alerts delivered via Tae within 60 seconds of detection
- No alert fatigue (transient failures filtered out)
