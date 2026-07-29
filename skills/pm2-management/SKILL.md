---
name: pm2-management
description: Use when configuring PM2, writing ecosystem.config.js, managing process lifecycle, or troubleshooting PM2 restart and cluster issues
---

# PM2 Management

Process management with PM2. Reliable service lifecycle on VPS.

## Preconditions

- PM2 installed globally on target machine (`npm i -g pm2`)
- Application ready to run
- ecosystem.config.js exists or needs creation

## Steps

### 1. Ecosystem Config

```javascript
// ecosystem.config.js
module.exports = {
  apps: [{
    name: 'app-name',
    script: 'dist/index.js',
    instances: 1,              // or 'max' for cluster
    exec_mode: 'fork',         // or 'cluster'
    env: {
      NODE_ENV: 'production',
      PORT: 3000
    },
    max_memory_restart: '512M',
    exp_backoff_restart_delay: 100,
    max_restarts: 10,
    min_uptime: '10s',
    kill_timeout: 5000,
    listen_timeout: 10000,
    log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
    error_file: './logs/error.log',
    out_file: './logs/out.log',
    merge_logs: true,
  }]
};
```

### 2. Cluster Mode

Use cluster mode only when:
- Application is stateless (no in-memory sessions)
- CPU-bound workload benefits from multiple cores
- Graceful reload needed (zero-downtime restarts)

```javascript
instances: 'max',  // one per CPU core
exec_mode: 'cluster',
```

For most of the user's services: `fork` mode with 1 instance is sufficient.

### 3. Restart Strategies

- **exp_backoff_restart_delay**: exponential backoff on crash (prevents restart loops)
- **max_restarts**: limit restarts in `min_uptime` window
- **min_uptime**: app must run this long to count as "started" (default 1s, set to 10s)
- **max_memory_restart**: auto-restart if memory exceeds threshold

Detect crash loops: if PM2 shows "errored" status or restart count climbing fast, investigate logs before restarting again.

### 4. Graceful Reload

For zero-downtime deploys (cluster mode):
```bash
pm2 reload app-name
```

For fork mode (brief downtime):
```bash
pm2 restart app-name
```

After any restart:
```bash
pm2 status     # verify "online"
pm2 logs --lines 20  # check for errors
```

### 5. Log Management

```bash
pm2 logs app-name --lines 50   # tail recent logs
pm2 flush                       # clear all logs
pm2 install pm2-logrotate       # auto-rotate logs
```

Logrotate config:
- Max file size: 10MB
- Retain: 7 files
- Compress rotated logs

### 6. Monitoring

```bash
pm2 monit        # real-time CPU/memory dashboard
pm2 status       # process list with status
pm2 describe app # detailed process info
```

Key metrics to watch:
- Restart count (should not climb)
- Memory usage (should be stable)
- CPU usage (spikes ok, sustained high = investigate)
- Uptime (should grow, not reset frequently)

### 7. Save and Startup

```bash
pm2 save              # save current process list
pm2 startup           # generate startup script for OS boot
```

Run `pm2 save` after every configuration change.

## Verification / Exit Criteria

- ecosystem.config.js exists with proper configuration
- App shows "online" in `pm2 status`
- No restart loops (restart count stable)
- Logs rotating properly (not filling disk)
- `pm2 save` run after changes
- Startup script configured for OS reboot persistence
