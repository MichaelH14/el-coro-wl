---
name: vps-sync
description: Use when syncing configuration or knowledge files between Mac and VPS, or when resolving sync conflicts between machines
---

# VPS Sync

Synchronize configuration and knowledge state between Mac and VPS. All or nothing — no partial syncs.

## Preconditions

- VPS is reachable (Tailscale or direct SSH)
- SSH credentials configured
- Sync manifest exists listing which files to sync
- No active editing session on target files

## Steps

### 1. Verify Connectivity

```bash
ping -c 1 -W 3 $VPS_IP || echo "UNREACHABLE"
```

If VPS is unreachable:
- Log the failed attempt with timestamp
- Postpone sync to next opportunity
- **Continue working locally** — never block on sync failure

### 2. Build Sync Manifest

Only sync knowledge files:

- `**/*.md` — agent definitions, rules, skill files
- `**/*.json` — configs, profile.json, state files
- `**/*.jsonl` — evolution logs

**NEVER sync**:
- Source code files (.ts, .js, .py, etc.)
- node_modules, .git, build artifacts
- Secrets, .env files, credentials

### 3. Detect Conflicts

Compare file checksums (SHA-256) between local and remote:

- **No conflict**: checksums match or one side is newer with no remote changes
- **Conflict**: both sides modified since last sync

### 4. Resolve Conflicts

Resolution strategy: **most recent wins + log conflict**

```json
{
  "file": "profile.json",
  "local_modified": "2026-03-31T10:00:00Z",
  "remote_modified": "2026-03-31T09:30:00Z",
  "winner": "local",
  "conflict_logged": true
}
```

The losing version is backed up to `sync/conflicts/` with timestamp before overwrite.

### 5. Atomic Transfer

Use rsync with atomic semantics:
- Transfer to temp directory first
- Verify checksums after transfer
- Move into place only if all files transferred successfully
- If any file fails: rollback entire sync

## Verification / Exit Criteria

- All files in manifest transferred or sync fully rolled back
- Conflicts logged with backup of losing version
- No code files were synced (verify against blocklist)
- Checksums match post-transfer
- Sync timestamp updated in state store
- If VPS was unreachable: postponement logged, local work unblocked
