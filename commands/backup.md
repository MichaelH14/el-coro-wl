---
name: backup
description: Backup databases and configs for current project
arguments: "[scope] — 'db', 'config', or 'all' (default: all)"
---

# /backup

You have been invoked to create a backup of the current project's data.

## Workflow

Use the backup-restore skill.

1. **Identify Scope** — What to back up:
   - **db**: Database dumps (MongoDB, PostgreSQL, SQLite, etc.).
   - **config**: Configuration files (.env, ecosystem.config.js, nginx configs, etc.).
   - **all**: Both databases and configs.

2. **Pre-Backup Checks**:
   - Verify backup destination directory exists and has space.
   - Check database connection is available.
   - Verify no active migrations or writes in progress (if possible).

3. **Execute Backup**:
   - **Database**: Use appropriate dump tool (mongodump, pg_dump, sqlite3 .dump).
   - **Configs**: Copy all config files preserving directory structure.
   - **Naming**: `backup-<project>-<scope>-<YYYY-MM-DD-HHmmss>.tar.gz`
   - Compress the backup.

4. **Verify Backup**:
   - Check file size is reasonable (not 0 bytes, not suspiciously small).
   - List backup contents to verify expected files are present.
   - If database: verify dump is readable (quick integrity check).

5. **Cleanup** — Manage backup retention:
   - Keep last 5 backups per project.
   - Delete older backups to save disk space.
   - Report how much space backups are using.

6. **Report**:
   - Backup created: [filename].
   - Size: [X MB].
   - Contents: [db tables / config files].
   - Location: [path].
   - Retention: [X of 5 slots used].
   - Restore command hint: how to restore from this backup.

## Rules
- NEVER overwrite an existing backup — always create new with timestamp.
- ALWAYS verify backup integrity after creation.
- NEVER backup secrets to an unencrypted location.
- If backup fails, report clearly and do NOT delete any existing backups.
