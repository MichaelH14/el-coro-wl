---
name: port-safety
description: Use when assigning a port to a service, before deploying, or when detecting port conflicts. Trigger before any service startup
---

# Port Safety

Never deploy to an occupied port. Always check first, detect conflicts, suggest alternatives.

## Preconditions

- SSH access to target machine (VPS or Mac)
- Knowledge of which services use which ports

## Steps

### 1. Check if Port is Free

On Linux (VPS):
```bash
ss -tlnp | grep :PORT
# or
lsof -i :PORT
```

On macOS:
```bash
lsof -i :PORT
```

If output is empty: port is free. If output shows a process: port is occupied.

### 2. List All Used Ports

Get full picture before assigning:
```bash
# Linux
ss -tlnp | grep LISTEN

# macOS
lsof -i -P -n | grep LISTEN
```

Known port assignments (keep updated):
```
3000 — [project name]
3006 — [Service Name] (intercombot)
3100 — [Service Name] dashboard
18789 — Tae gateway
```

### 3. Detect Conflicts

Before any service start or deploy:
1. Read the service's configured port from its .env or config
2. Check if that port is already in use
3. If conflict detected: STOP. Do not proceed.

Common conflict scenarios:
- Two services configured for same port in different .env files
- Old instance still running after failed deploy
- Development server left running on production port

### 4. Resolve Conflicts

Options (in order of preference):
1. **Reassign**: change the NEW service's port to an unused one
2. **Stop old**: if the occupying process is defunct/unnecessary, stop it properly
3. **Investigate**: if unsure what's on the port, identify it before any action

NEVER `kill -9` a process just to free a port without understanding what it is.

### 5. Suggest Available Port

When assigning a new service:
- Scan range 3000-3999 for web services
- Scan range 5000-5999 for internal services
- Pick first available port not in known assignments list
- Update the known assignments list after assignment

```bash
# Find first free port in range
for port in $(seq 3000 3100); do
  (echo >/dev/tcp/localhost/$port) 2>/dev/null || { echo "$port is free"; break; }
done
```

## Verification / Exit Criteria

- Port confirmed free before service starts
- No `kill -9` used without identifying the process first
- Known port assignments list stays current
- Conflict detected = deploy halted (not forced through)
- New port assignment documented in project config
