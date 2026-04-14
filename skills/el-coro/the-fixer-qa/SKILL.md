---
name: the-fixer-qa
description: Use before deploying or shipping any code, to run the pre-deploy quality gate checklist based on past production bugs
---

# THE FIXER QA

Pre-deploy quality gate based on real bugs from the user's projects. Every item on this list came from a production incident.

## Preconditions

- Code changes ready to deploy
- All unit and integration tests passing
- Developer claims "it works" (this is when QA matters most)

## Steps

### 1. Port Conflicts

- [ ] Target port verified free on VPS (`lsof -i :PORT`)
- [ ] No other service configured for same port
- [ ] Port documented in project config

This alone has caused multiple outages. Check it every time.

### 2. Environment Variables

- [ ] All required env vars exist in production .env
- [ ] No env vars reference localhost in production config
- [ ] No secrets hardcoded in code
- [ ] .env not committed to git

### 3. Deploy Method

- [ ] Using deploy.sh (NOT manual rsync of individual files)
- [ ] deploy.sh excludes node_modules, .git, .env
- [ ] npm install runs on VPS after rsync (not syncing node_modules)

### 4. Cloudflare Tunnel

- [ ] Tunnel routes configured via REMOTE API/dashboard
- [ ] NOT editing local config.yml
- [ ] Tunnel pointing to correct port

### 5. Database

- [ ] Migrations run before app restart
- [ ] No destructive migrations without backup
- [ ] Connection string correct for target environment

### 6. PM2

- [ ] ecosystem.config.js up to date
- [ ] App name matches expected process name
- [ ] `pm2 save` planned after restart
- [ ] Logs checked post-restart for crash loops

### 7. End-to-End Smoke Test

After deploy, verify manually:
- [ ] Health endpoint returns 200
- [ ] Core feature works (not just "app starts")
- [ ] User-facing pages load without errors
- [ ] API endpoints respond correctly

### 8. Rollback Ready

- [ ] Previous working build available for quick rollback
- [ ] Rollback steps documented (stop, restore, restart)
- [ ] Know the exact command to rollback before deploying

### 9. Cross-Reference Known Errors

Check against the 10 known Capa Leaf errors (from feedback-capa-leaf-errors):
- Incomplete startup mechanisms
- Stale references to old config
- Missing error handling on external calls
- Untested edge cases in core logic

If any of these patterns appear in current changes: fix before deploy.

## Verification / Exit Criteria

- Every checkbox above is checked (not skipped)
- Health check passes post-deploy
- No crash loops in PM2 logs
- Core feature verified working (not just "starts without error")
- Rollback plan confirmed before proceeding
- If ANY check fails: do not deploy, fix first
