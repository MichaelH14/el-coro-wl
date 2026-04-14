---
name: self-healing-deploy
description: Use when setting up auto-rollback deployments or when a deploy needs automatic health monitoring and rollback on failure
---

# Self-Healing Deployment

Automated deployment with health monitoring and instant rollback. If anything fails post-deploy, the system rolls back without human intervention.

## Preconditions

- All tests pass (unit + integration)
- Build completes cleanly (no warnings treated as errors)
- QA gate approved (if applicable)
- deploy.sh exists in project root with rollback support
- VPS accessible via SSH
- PM2 running on VPS
- Service URL known for health checks

## Steps

### 1. Run Test Suite

```bash
npm test
```

- ALL tests must pass. Zero tolerance for failures.
- If any test fails: abort pipeline immediately. Do not proceed.
- Log test results to state store for audit trail.

### 2. Build Production

```bash
npm run build
```

- Build must complete without errors.
- Verify output artifacts exist and are non-empty.
- Record build hash/timestamp for rollback reference.

### 3. Deploy via deploy.sh

```bash
./deploy.sh
```

- deploy.sh handles rsync, npm install on VPS, PM2 restart.
- NEVER rsync individual files (see feedback-deploy-rsync).
- deploy.sh must create a backup of current version before deploying.

### 4. Wait for Stabilization

Wait 30 seconds after deploy completes. This allows:
- PM2 to fully restart the process
- Any startup initialization to complete
- Connection pools to establish

### 5. Health Check: HTTP

```bash
curl -sf http://SERVICE_URL/health || curl -sf http://SERVICE_URL/
```

- Expect HTTP 200 response.
- Timeout: 10 seconds per attempt, 3 attempts with 5s gap.
- If all 3 attempts fail: trigger rollback.

### 6. Health Check: PM2

```bash
ssh vps "pm2 jlist"
```

- Status must be "online" (not "errored", "stopped", or "launching").
- Restart count must not be incrementing (no crash loop).
- Memory usage must be within expected bounds.

### 7. Monitor Window (5 Minutes)

After initial health checks pass, monitor for 5 minutes:
- Check PM2 status every 30 seconds.
- Watch for restart count increases (crash loops).
- Check error logs: `pm2 logs APP_NAME --err --lines 50`
- If any anomaly detected during window: trigger rollback.

### 8. Rollback (If Any Check Fails)

```bash
./deploy.sh rollback
```

Rollback sequence:
1. Stop current version via PM2
2. deploy.sh restores previous backup
3. PM2 restarts with restored version
4. Run health check on rolled-back version (must pass)
5. Alert via Tae: POST to Tae API with rollback details
6. Log rollback event to state store

Alert message format:
```
Deploy FAILED for [project]. Auto-rolled back.
Reason: [health check failure / crash loop / error spike]
Previous version restored and healthy.
```

## Verification / Exit Criteria

- Service responds HTTP 200 to health endpoint
- PM2 shows app "online" with stable restart count
- No error logs in the 5-minute monitoring window
- If rollback occurred: previous version confirmed healthy
- Deploy result (success or rollback) logged to state store
- If rollback: root cause investigation required before next deploy attempt
