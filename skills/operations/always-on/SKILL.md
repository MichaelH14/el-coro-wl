---
name: always-on
description: Use when configuring the Mac to stay awake 24/7, troubleshooting sleep issues, or checking always-on status after a wake-up
---

# Always-On

Keep the user's Mac running 24/7 for services. Prevent sleep, detect wake-ups, report status.

## Preconditions

- macOS machine (your-macbook)
- Admin access for pmset configuration
- Amphetamine app installed (or equivalent)
- Services running that require uptime (Tae, etc.)

## Steps

### 1. Prevent Sleep

System-level sleep prevention:
```bash
# Disable system sleep
sudo pmset -a sleep 0
sudo pmset -a disksleep 0
sudo pmset -a displaysleep 0  # optional: let display sleep to save energy

# Verify settings
pmset -g
```

Expected output should show:
```
sleep           0
disksleep       0
```

### 2. Amphetamine (Belt and Suspenders)

pmset alone is not always enough. Use Amphetamine as backup:
- Enable "Start Session When Amphetamine Starts"
- Enable "Start Amphetamine When Mac Starts"
- Session type: "Indefinite"
- Allow display sleep: Yes (saves power, services still run)

### 3. Wake-Up Detection

When the Mac wakes from unexpected sleep or restart, detect it:

```bash
# Check last boot time
sysctl kern.boottime

# Check sleep/wake history
pmset -g log | grep -E "Wake|Sleep" | tail -10
```

On SessionStart (Claude Code session begins):
1. Check uptime: `uptime`
2. If uptime < 1 hour and services should be running: something restarted
3. Verify all services are running: `pm2 status`
4. Report any services that need restart

### 4. Wake-Up Report

Generate on every new Claude Code session:

```
WAKE-UP REPORT

Uptime: [X days, Y hours]
Last boot: [timestamp]
Unexpected restart: [yes/no]

Services:
- Tae gateway: [running/stopped]
- [other services]: [status]

Actions needed:
- [List any services that need restart]
- [List any issues detected]
```

### 5. Power Event Handling

Prepare for power events:
- **Power outage**: UPS recommended; if no UPS, services auto-start on boot
- **macOS update**: schedule updates manually, verify services after reboot
- **Lid close**: configure to NOT sleep when lid closed (if using external display)

```bash
# Prevent sleep on lid close (when connected to power)
sudo pmset -a lidwake 1
```

### 6. Network Persistence

Ensure network stays up:
- Tailscale set to auto-connect on boot
- WiFi set to auto-join known networks
- If network drops: services should handle reconnection gracefully

Check Tailscale status:
```bash
tailscale status
```

## Verification / Exit Criteria

- `pmset -g` shows sleep 0
- Amphetamine running with indefinite session
- Machine has not slept unexpectedly (check pmset log)
- All services running after any restart
- Wake-up report generated on session start
- Tailscale connected and reachable
