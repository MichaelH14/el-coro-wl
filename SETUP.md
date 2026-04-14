# El Coro — Setup Guide

Full installation walkthrough.

## Prerequisites

- [Claude Code](https://claude.com/claude-code) installed
- Node.js 18+ (for hooks and VPS workers)
- Git
- (Optional) A VPS with SSH access
- (Optional) A WhatsApp API bridge (e.g. whatsapp-web.js, Baileys, Green API)

---

## 1. Clone the repo

```bash
git clone https://github.com/yourusername/el-coro-wl.git ~/projects/el-coro
cd ~/projects/el-coro
```

## 2. Create your config

```bash
cp config/el-coro.example.json config/el-coro.json
```

Open `config/el-coro.json` and fill in your values:

```jsonc
{
  "owner": {
    "name": "Jane Doe",
    "github": "https://github.com/janedoe/el-coro"
  },
  "vps": {
    "host": "1.2.3.4",           // your VPS IP or hostname
    "user": "ubuntu",            // your VPS SSH user
    "remoteDir": "/home/ubuntu/el-coro-vps",
    "dashboardPort": 3200
  },
  "services": [
    // Services the monitor agent and workers will watch
    {
      "name": "My API",
      "port": 3000,
      "url": "api.mydomain.com",
      "description": "Main API server",
      "healthPath": "/health",   // optional, defaults to "/"
      "statsPath": "/api/stats"  // optional, for growth-worker
    }
  ],
  "notifications": {
    "whatsapp": {
      "enabled": false,          // set to true to enable alerts
      "apiUrl": "http://localhost:3004"
    }
  },
  "products": [
    { "name": "My App", "description": "What my app does" }
  ]
}
```

## 3. Install as a Claude Code plugin

Inside any Claude Code session:

```
/plugin marketplace add MichaelH14/el-coro-wl
/plugin install el-coro@el-coro-wl
```

Restart Claude Code. You should see El Coro's activation message on session start.

**Updates:**
```
/plugin marketplace update el-coro-wl
```
Auto-update is enabled by default — you generally don't need to run this manually.

## 4. (Optional) Deploy VPS workers

If you want 24/7 monitoring, support, and growth workers running on your VPS:

### 4a. Set SSH credentials as env vars

```bash
# Add to ~/.zshrc or ~/.bashrc
export EL_CORO_VPS_HOST=1.2.3.4
export EL_CORO_VPS_USER=ubuntu
export EL_CORO_REMOTE_DIR=/home/ubuntu/el-coro-vps
```

### 4b. Prep the VPS

SSH into your VPS and:

```bash
# Install Node.js, PM2
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install nodejs
npm install -g pm2

# Create the target dir
mkdir -p ~/el-coro-vps
```

### 4c. Deploy workers

From your local machine:

```bash
cd ~/projects/el-coro/vps
./deploy.sh
```

This rsyncs the workers to your VPS, runs `npm install`, and starts PM2.

### 4d. Verify

```bash
ssh $EL_CORO_VPS_USER@$EL_CORO_VPS_HOST "pm2 status"
```

You should see: `el-coro-monitor`, `el-coro-support`, `el-coro-growth`.

## 5. (Optional) Deploy the dashboard

The dashboard is a Next.js app with auth protection.

### 5a. Set dashboard env vars on VPS

SSH into your VPS, then:

```bash
cat > ~/el-coro-vps-dashboard/.env <<EOF
DASHBOARD_USER=admin
DASHBOARD_PASSWORD=$(openssl rand -hex 16)
EL_CORO_VPS_DATA_DIR=/home/$USER/el-coro-vps
EOF
```

### 5b. Deploy

From your local machine:

```bash
cd ~/projects/el-coro/dashboard
./deploy.sh
```

### 5c. Expose the dashboard

The dashboard runs on the port you configured (`vps.dashboardPort`, default 3200). Expose it via:
- **Cloudflare Tunnel** (recommended) — free, no open ports
- **Nginx reverse proxy** — if you already have one
- **Direct** — only for local/VPN access

## 6. (Optional) Set up WhatsApp notifications

El Coro can send alerts via WhatsApp using any API bridge that exposes `POST /api/send { to, message }`.

Popular options:
- [whatsapp-web.js](https://github.com/pedroslopez/whatsapp-web.js) — self-hosted
- [Baileys](https://github.com/WhiskeySockets/Baileys) — self-hosted
- [Green API](https://green-api.com/) — paid SaaS

Once your bridge is running, edit `config/el-coro.json`:

```jsonc
{
  "notifications": {
    "whatsapp": {
      "enabled": true,
      "apiUrl": "http://localhost:3004"  // your bridge URL
    }
  }
}
```

Restart the VPS workers (`pm2 restart all`).

---

## Customization

### Rules
Edit files in `rules/common/` and `rules/typescript/` to match your coding standards. `user-preferences.md` is specifically for your personal quirks.

### Agents
Each agent is an `.md` file in `agents/`. Edit to change behavior, add rules, or modify the domain.

### Skills
Skills live in `skills/<category>/<name>/SKILL.md`. Customize workflows to your stack.

### Hooks
Hooks are declared in `hooks/hooks.json` and implemented in `hooks/scripts/`. Disable any by removing from `hooks.json`.

---

## Troubleshooting

### Hooks not firing
- Verify `hooks/hooks.json` syntax is valid JSON
- Check that `node` is in your PATH when Claude Code runs
- Check Claude Code logs for hook errors

### VPS sync not working
- Verify `EL_CORO_VPS_HOST` and `EL_CORO_VPS_USER` env vars are set
- Test SSH connection: `ssh $EL_CORO_VPS_USER@$EL_CORO_VPS_HOST`
- Check `hooks/scripts/sync-to-vps.js` output on session close

### Services show as DOWN in monitor
- Verify `config/el-coro.json` has correct ports
- Verify the services actually respond on localhost from the VPS
- Check `vps/monitor-logs.json` for error details

### Dashboard 401 Unauthorized
- Verify `DASHBOARD_USER` and `DASHBOARD_PASSWORD` env vars are set on the VPS
- Clear browser cookies and try again

---

## Upgrading

```bash
cd ~/projects/el-coro
git pull origin main
# Redeploy VPS if needed
cd vps && ./deploy.sh
cd ../dashboard && ./deploy.sh
```

Your `config/el-coro.json` is gitignored, so it won't be overwritten.
