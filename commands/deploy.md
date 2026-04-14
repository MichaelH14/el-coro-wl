---
name: deploy
description: Full deploy workflow with validation and health checks
arguments: "[project] — project name to deploy (optional, auto-detects from cwd)"
---

# /deploy

You have been invoked to deploy a project to production.

## Workflow

1. **Pre-Deploy Validation** — deploy-validator agent runs checks:
   - Build compiles without errors.
   - All tests pass.
   - No uncommitted changes (warn if dirty).
   - Verify target ports are FREE before deploying (CRITICAL — check with `lsof -i`).
   - Check deploy.sh exists and is executable.

2. **Build** — Run the project's build command.
   - Typically `npm run build` or equivalent.
   - If build fails, STOP and report. Do NOT proceed.

3. **Port Validation** — Verify no port conflicts.
   - Known ports: Tae (3004), [Service Name] (3100), [Service Name] (3006).
   - If target port is occupied, identify what's using it and report.
   - NEVER kill another service's port without the user's approval.

4. **Deploy** — Use deploy-workflow skill.
   - ALWAYS use `deploy.sh` — NEVER rsync files directly to VPS.
   - If Cloudflare Tunnel is involved, use the REMOTE API, not local config.yml.
   - Deploy via the project's deploy.sh script.

5. **PM2 Restart** — Restart the service via PM2.
   - `pm2 restart <service-name>` or `pm2 start ecosystem.config.js`.
   - Verify PM2 shows the service as "online".

6. **Health Check** — Verify the deployment is working.
   - Hit the service's health endpoint.
   - Check logs for errors in first 30 seconds.
   - Verify the service responds correctly.

7. **Report** — Deploy summary:
   - Status: SUCCESS or FAILED.
   - Service URL, port, PM2 status.
   - If failed: what went wrong and rollback instructions.

## Rules
- NEVER deploy without passing build and tests first.
- NEVER rsync loose files — always use deploy.sh.
- ALWAYS verify ports are free before assigning services.
- If ANY step fails, STOP immediately and report.
