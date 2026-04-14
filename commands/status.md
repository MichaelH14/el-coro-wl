---
name: status
description: Dashboard — services, ports, deploys, VPS health, metrics
arguments: none
---

# /status

You have been invoked to display the current system status dashboard.

## Workflow

Gather information from multiple sources and present as a unified dashboard.

1. **Running Services** — Check what's running:
   - Query PM2 process list (`pm2 jlist` or `pm2 ls`).
   - For each service: name, status (online/stopped/erroring), uptime, restarts, memory usage.
   - Flag any service with status != "online" or restart count > 5.

2. **Ports in Use** — Scan known ports:
   - Tae: 3004
   - [Service Name]: 3006
   - [Service Name]: 3100
   - [Product Name]: check project config for assigned port.
   - Any other ports defined in project configs.
   - Flag conflicts or unexpected processes on known ports.

3. **Last Deploy** — Check deploy history:
   - Most recent deploy per project: date, commit, who triggered.
   - Check git log for deploy tags or markers.

4. **VPS Health** — System metrics:
   - CPU usage, memory usage, disk usage.
   - Flag if any metric is above 80%.
   - Check available disk space.
   - Network connectivity status.

5. **Open Tickets** — Check for pending work:
   - Scan state store for open tickets/issues.
   - List by priority: critical first.

6. **Growth Metrics Summary** — High-level numbers:
   - Active users, signups, revenue (if tracked).
   - Brief trend: up, down, flat.

7. **Present Dashboard** — Format as a clean, scannable report:
   ```
   === EL CORO STATUS ===
   Services: X running, Y stopped
   Ports: [list with status]
   Last Deploy: [project] at [time]
   VPS: CPU X% | MEM X% | DISK X%
   Tickets: X open (Y critical)
   Growth: [brief trend]
   ```

## Rules
- Keep the output concise — this is a dashboard, not a detailed report.
- ALWAYS flag anything that needs immediate attention at the TOP.
- If a service is down, suggest the fix (e.g., `pm2 restart <name>`).
- Run this quickly — it's meant to be a fast status check.
