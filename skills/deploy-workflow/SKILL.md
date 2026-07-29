---
name: deploy-workflow
description: Use when deploying to VPS, running the deploy pipeline, or performing any production deployment from build through health check
---

# Deploy Workflow

the user's standard deployment pipeline. Every deploy follows this sequence. No shortcuts.

## Preconditions

- Code built and tested locally
- deploy.sh script exists in project root
- VPS accessible via SSH
- PM2 running on VPS
- Cloudflare Tunnel configured (remote API, never local config.yml)

## Steps

### 1. Build

```bash
npm run build
```

- Build must complete without errors
- Check build output size (flag if > 50% larger than previous)
- Verify all environment variables referenced in code exist in production .env

### 2. Validate Ports

BEFORE deploying, verify target port is free on VPS:

```bash
ssh vps "lsof -i :PORT" # or ss -tlnp | grep PORT
```

- If port is occupied: identify what's using it
- NEVER kill an unknown process to free a port
- If conflict: reassign port in config, not force-stop existing service

This step is NON-NEGOTIABLE (see feedback-verificar-puertos).

### 3. Deploy via deploy.sh

ALWAYS use the project's deploy.sh script. NEVER rsync individual files.

```bash
./deploy.sh
```

deploy.sh handles: rsync (with proper excludes), npm install on VPS, build on VPS if needed.

If deploy.sh does not exist: create it first, do not deploy manually.

### 4. Cloudflare Tunnel

Configure tunnel via REMOTE Cloudflare API only:
- NEVER edit local config.yml for tunnel routes
- Use `cloudflared tunnel route` commands or Cloudflare dashboard API
- Verify tunnel is routing to correct local port after deploy

(See feedback-cloudflare-tunnel-deploy)

### 5. PM2 Restart

On VPS:
```bash
pm2 restart ecosystem.config.js  # or specific app name
pm2 save
```

- Use graceful reload when possible: `pm2 reload app_name`
- Check PM2 logs immediately after restart for crash loops
- If app crashes 3 times in 10 seconds: rollback immediately

### 6. Health Check

Within 60 seconds of deploy:
```bash
curl -f http://localhost:PORT/health || echo "HEALTH CHECK FAILED"
```

- HTTP 200 = deploy successful
- Any other response = investigate before declaring success
- Check PM2 status: `pm2 status` (should show "online", not "errored")

### 7. Rollback

If health check fails:
1. `pm2 stop app_name`
2. Restore previous build from backup
3. `pm2 restart app_name`
4. Verify health check passes on rolled-back version
5. Investigate failure -- do not re-deploy until root cause found

## Verification / Exit Criteria

- Build completed without errors
- Port confirmed free before deploy
- deploy.sh used (not manual rsync)
- CF Tunnel configured via remote API
- PM2 shows app "online" with no restart loops
- Health check returns 200
- If any step fails: rollback executed and logged
