---
name: health
description: Health check ALL VPS services and El Coro plugin status
arguments: none
---

# /health

You have been invoked to perform a comprehensive health check.

## Workflow

1. **VPS Services** — Check each known service:
   - **Tae** (port 3004): HTTP health endpoint check. Report: up/down, response time.
   - **[Service Name]** (port 3100): HTTP health endpoint check. Report: up/down, response time.
   - **[Service Name]** (port 3006): HTTP health endpoint check. Report: up/down, response time.
   - **[Product Name]**: Check process status via PM2. Report: running/stopped, uptime.
   - **[Product Name]**: Check process status and port. Report: running/stopped, uptime.

2. **Port Scan** — Verify expected ports match reality:
   - For each service, verify the expected port is in use by the correct process.
   - Flag any unexpected processes on known ports.
   - Flag any expected service NOT listening on its port.

3. **PM2 Status** — Full PM2 process list:
   - Name, status, uptime, restarts, memory, CPU.
   - Flag: erroring status, high restart count (>5), high memory (>500MB).

4. **System Resources** — Check VPS resources:
   - CPU: current usage percentage.
   - Memory: used/total, percentage.
   - Disk: used/total, percentage.
   - Flag any resource above 80% utilization.

5. **El Coro Plugin Status** — Self-check:
   - Agent files: all present and valid.
   - Skill files: all present and valid.
   - Command files: all present and valid.
   - Config: plugin.json valid.
   - State store: accessible and not corrupted.

6. **Report** — Health dashboard:
   ```
   === HEALTH CHECK ===
   Tae (3004):         [OK] 200ms
   [Service Name] (3100):      [OK] 150ms
   [Service Name] (3006):[OK] 180ms
   [Product Name]:        [OK] uptime 3d
   [Product Name]:            [DOWN] — not running
   ---
   CPU: 45% | MEM: 62% | DISK: 55%
   ---
   El Coro: ALL SYSTEMS GO
   ```

## Rules
- Health check should complete in under 30 seconds.
- DOWN services are flagged at the TOP of the report.
- Include suggested fix for any DOWN service.
- If VPS is unreachable, report that clearly instead of hanging.
