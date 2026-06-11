# El Coro — Claude Code Plugin

An AI orchestration plugin for [Claude Code](https://claude.com/claude-code) that turns a single CLI into a coordinated team of specialized agents.

## What's inside

| Component | Count |
|---|---|
| Agents | 27 |
| Skills | 85 |
| Commands | 44 |
| Hook scripts | 29 |
| Rules | 13 |
| Workflows | 1 |
| VPS Workers | 4 |

### Agents
- **Orchestrators:** `conductor`, `qa-gate`, `genesis`, `sombra`, `cortex`
- **Specialists:** `planner`, `architect`, `api-designer`, `tdd-guide`, `debugger`, `build-resolver`, `refactor-cleaner`, `migration-assistant`, `code-reviewer`, `ts-reviewer`, `security-reviewer`, `performance-profiler`, `database-reviewer`, `deploy-validator`, `e2e-runner`, `doc-updater`, `monitor`
- **Business:** `growth-engine`, `support-agent`, `designer`, `design-critic`, `sprite-editor`

### Skills
Organized across 15 categories: `api`, `brainstorming`, `database`, `deploy`, `el-coro`, `frontend`, `growth`, `operations`, `security`, `support`, `system`, `testing`, `typescript`, `ui`, `workflow`.

### Commands
44 slash commands covering planning, execution, QA, deploy, debugging, growth, support, observability, and self-evolution.

### Hooks
Pre/Post tool-use hooks for: secret scanning, port safety, deploy guard, type-check, lint-check, console-log warnings, sombra observation (tool use + user prompts), cortex learning, session summary, core-rules re-injection after compaction, build-failure hints, and VPS sync.

### Runtime state
All runtime state (sombra profile, session logs, instincts, SQLite store, sync logs) lives OUTSIDE the plugin install, under `~/.el-coro/` — so plugin updates and reinstalls never wipe what the system has learned. Override the location with the `EL_CORO_STATE_DIR` env var.

### VPS Workers (24/7 background)
- `monitor-worker` — health checks on configured services
- `support-worker` — ticket polling via optional WhatsApp API
- `growth-worker` — daily metrics collection
- `dashboard` — Next.js dashboard with auth

---

## Quick start

### 1. Install via Claude Code marketplace

Inside a Claude Code session, run:

```
/plugin marketplace add MichaelH14/el-coro-wl
/plugin install el-coro@el-coro-wl
```

That's it. El Coro activates on every new session via the `SessionStart` hook.

**Local marketplace (recommended for development):** if you forked/cloned the repo and want zero drift between your edits and the installed plugin, add your local clone as the marketplace instead:

```
claude plugin marketplace add ~/projects/el-coro-wl
claude plugin install el-coro@el-coro-wl
```

After editing the repo: commit (the pre-commit hook auto-bumps the version) and run `claude plugin update el-coro@el-coro-wl` to pick up the changes.

### 2. Configure

After install, the plugin lives under `~/.claude/plugins/cache/el-coro-wl/el-coro/<version>/`.
Clone the repo locally to edit your personal config:

```bash
git clone https://github.com/MichaelH14/el-coro-wl.git ~/projects/el-coro
cd ~/projects/el-coro
cp config/el-coro.example.json config/el-coro.json
```

Edit `config/el-coro.json` with your values:
- `owner.name` / `owner.github` — your identity
- `vps.host` / `vps.user` — your VPS SSH credentials (optional)
- `services` — the services you want `monitor` / `growth-engine` to track
- `notifications.whatsapp` — optional, enable if you have a WhatsApp API bridge
- `products` — the products `growth-engine` / `support-agent` work on

### 3. Updates

Updates are automatic when auto-update is enabled (default). To force an update:

```
/plugin marketplace update el-coro-wl
```

---

## Contributing / Releasing

If you forked this repo and want to publish updates under your own marketplace:

```bash
# One-time setup (enables auto-bump pre-commit hook)
./scripts/install-hooks.sh
```

From then on, every commit that touches plugin components (`agents/`, `commands/`, `skills/`, `hooks/`, `rules/`, `dashboard/`, `vps/`, `scripts/`, `BLINDAJE.md`) automatically bumps the patch version in `.claude-plugin/plugin.json`. Users who installed your marketplace get the update on their next Claude Code session.

Manual bump:
```bash
node scripts/bump-version.mjs minor   # or major
```

Skip auto-bump for a specific commit (e.g. docs only):
```bash
EL_CORO_NO_BUMP=1 git commit -m "docs: ..."
```

### 4. (Optional) Deploy VPS workers

If you want the 24/7 background workers (monitor, support, growth, dashboard):

```bash
# Set your VPS SSH credentials
export EL_CORO_VPS_HOST=your.vps.ip
export EL_CORO_VPS_USER=your-vps-user

# Deploy
cd vps && ./deploy.sh
```

Then deploy the dashboard:

```bash
cd dashboard && ./deploy.sh
```

---

## Architecture

### Mac (interactive)
- Claude Code session
- Agents, skills, commands, hooks
- `sombra` observes you; `cortex` learns from your corrections
- Runtime state persists in `~/.el-coro/` (survives plugin reinstalls)
- On session close, `sync-to-vps.js` uploads profile + instincts and mirrors agents/skills/commands to the VPS (logged to `~/.el-coro/logs/sync.log`)

### VPS (24/7 background)
- PM2 processes for monitor / support / growth / dashboard
- Reads `config/el-coro.json` for services list
- Sends alerts to WhatsApp API (if configured) when services go down
- Dashboard at `https://your-domain.com` (set up via Cloudflare Tunnel or reverse proxy)

### Graceful degradation
- No VPS configured → sync hook exits silently, no VPS features
- No WhatsApp configured → alerts log locally, no push notifications
- No services configured → workers log a message and idle
- The plugin still works fully as a Mac-local agent system

---

## Key files

- `.claude-plugin/plugin.json` — plugin manifest
- `.claude-plugin/marketplace.json` — local marketplace entry
- `config/el-coro.example.json` — config template
- `hooks/hooks.json` — hook declarations
- `BLINDAJE.md` — the iron rules every agent inherits
- `agents/` — one `.md` per agent
- `skills/<category>/<name>/SKILL.md` — skills
- `commands/` — slash commands
- `vps/` — background workers for 24/7 operation
- `dashboard/` — Next.js dashboard

---

## Philosophy

El Coro is built around these principles:

1. **Nothing self-approves.** Every deliverable passes through `qa-gate`.
2. **Iron rules, not suggestions.** Every agent inherits 12 universal rules (UA-1 to UA-12). See `BLINDAJE.md`.
3. **Anti-hallucination by default.** Agents verify files, libraries, and commands before suggesting them.
4. **Continuous learning.** `sombra` profiles the user; `cortex` promotes patterns to instincts.
5. **Graceful degradation.** If a subsystem is missing (VPS, WhatsApp, etc.), the plugin keeps working.

---

## License

MIT — see `LICENSE`.
