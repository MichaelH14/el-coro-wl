# Deploy

Standards for deploying services safely and consistently.

## ONLY deploy.sh to VPS

All deployments to VPS go through `deploy.sh`. Never rsync individual files, never scp manually, never copy-paste via SSH.

**Why:** Loose file copies miss dependencies, skip build steps, and create inconsistent state. `deploy.sh` is the single source of truth for deployment.

## Verify Ports Before Assigning

ALWAYS check that a port is free before assigning a service to it. Use `lsof -i :PORT` or `ss -tlnp | grep PORT`.

```bash
# Before assigning port 3000
lsof -i :3000
# If output is non-empty, the port is taken. Pick another.
```

**Why:** Port conflicts cause silent failures where the new service can't start but the old one keeps running, making it look like nothing changed.

## Cloudflare Tunnel via Remote API

VPS uses Cloudflare Tunnel configured REMOTELY via the Cloudflare API. Never edit local `config.yml` for tunnel configuration.

**Why:** Local config.yml gets overwritten by the remote configuration on restart. Changes made locally are lost and create confusing mismatches.

## PM2 for All Node.js Processes

Every Node.js service runs under PM2 with a named process and ecosystem file.

```javascript
// ecosystem.config.js
module.exports = {
  apps: [{
    name: "service-name",
    script: "./dist/index.js",
    instances: 1,
    autorestart: true,
    max_memory_restart: "512M",
  }]
};
```

**Why:** PM2 provides process management, automatic restarts on crash, log management, and monitoring. Running Node.js directly means a single uncaught exception kills the service permanently.

## Health Check After Every Deploy

Every deployment must include a health check that verifies the service is running and responding correctly.

```bash
# After deploy
curl -f http://localhost:PORT/health || echo "DEPLOY FAILED: health check failed"
```

**Why:** A deploy that doesn't verify success is a deploy that might have failed silently. Always confirm the service is alive.

## Rollback Plan

Every deploy must have a documented rollback path. Know how to revert before you deploy.

- Keep previous version artifacts available
- Document the rollback command in deploy.sh
- Test rollback procedure periodically

**Why:** Deployments fail. The question isn't if but when. Having a tested rollback path turns a crisis into a 30-second recovery.
