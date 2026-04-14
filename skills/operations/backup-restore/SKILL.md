---
name: backup-restore
description: Use when setting up backups, verifying restore procedures, scheduling backup jobs, or executing a backup/restore operation
---

# Backup and Restore

Automated backups of databases and configs. Verified restores. Defined retention.

## Preconditions

- Database accessible for dump (PostgreSQL default)
- Backup storage location defined (local + remote)
- Sufficient disk space for retention period
- Restore testing environment available

## Steps

### 1. What to Backup

| Category | Items | Frequency |
|----------|-------|-----------|
| Database | Full pg_dump of all production DBs | Daily |
| Configs | .env files, ecosystem.config.js, nginx configs | On change |
| State store | El Coro state files (.json, .jsonl) | Daily |
| PM2 | `pm2 save` dump (process list) | On change |

Do NOT backup:
- node_modules (reinstall from package-lock.json)
- Build artifacts (rebuild from source)
- Logs (separate retention policy)

### 2. Database Backup

```bash
# Full backup with compression
pg_dump -Fc -f backup_$(date +%Y%m%d_%H%M%S).dump $DATABASE_URL

# Verify backup is not empty
ls -la backup_*.dump  # should be > 0 bytes
```

For large databases: use `pg_dump -Fc` (custom format, compressed, supports parallel restore).

### 3. Backup Storage

Store backups in 2 locations:
- **Local**: on VPS filesystem (fast restore)
- **Remote**: off-site storage (disaster recovery)

Naming convention:
```
backups/
  db/
    lottery_bot_20260331_120000.dump
    product-name_20260331_120000.dump
  config/
    lottery_bot_env_20260331.enc
    ecosystem_20260331.js
```

Encrypt config backups (they contain secrets):
```bash
gpg -c --batch --passphrase "$BACKUP_KEY" config.env
```

### 4. Retention Policy

| Type | Keep | Cleanup |
|------|------|---------|
| Daily backups | 7 days | Delete older daily |
| Weekly backups | 4 weeks | Keep Sunday backup |
| Monthly backups | 6 months | Keep 1st of month |

Automate cleanup: delete expired backups on schedule.

### 5. Restore Verification

Monthly: test restore to verify backups are valid.

```bash
# Restore to test database
pg_restore -d test_db backup_latest.dump

# Verify row counts match
psql test_db -c "SELECT count(*) FROM users;"
# Compare with production count
```

A backup that has never been tested is not a backup.

### 6. Restore Procedure

When restoring in production:
1. Stop the application (`pm2 stop app-name`)
2. Create a backup of current state (yes, backup before restore)
3. Restore database: `pg_restore -c -d production_db backup.dump`
4. Restore configs from encrypted backup
5. Restart application (`pm2 restart app-name`)
6. Verify application health

## Verification / Exit Criteria

- Daily backups running on schedule
- Backups stored in 2 locations (local + remote)
- Config backups encrypted
- Retention policy enforced (old backups cleaned up)
- Restore tested monthly (verified working)
- Restore procedure documented and rehearsed
