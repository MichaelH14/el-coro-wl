---
name: database-migrations
description: Use when creating, running, or planning database migrations, including zero-downtime changes and data vs schema separation
---

## Preconditions
- Migration tool: Prisma Migrate, Drizzle Kit, knex, or raw SQL files
- Staging environment that mirrors production schema

## Core Rules
1. **Forward-only by default** — rollback scripts are nice-to-have, not required
2. **Reversible when possible** — add `down()` for non-destructive changes
3. **Never lock tables in production** — avoid `ALTER TABLE ... ADD COLUMN ... DEFAULT` on large tables without `CONCURRENTLY`
4. **Data migration separate from schema** — schema in one migration, data backfill in another

## Zero-Downtime Migration Pattern
```sql
-- Step 1: Add nullable column (no lock)
ALTER TABLE users ADD COLUMN display_name TEXT;

-- Step 2: Backfill data (separate migration, batched)
UPDATE users SET display_name = name WHERE display_name IS NULL LIMIT 10000;

-- Step 3: Application code handles both old and new column

-- Step 4: Set NOT NULL constraint (after backfill complete)
ALTER TABLE users ALTER COLUMN display_name SET NOT NULL;

-- Step 5: Drop old column (after all code uses new column)
ALTER TABLE users DROP COLUMN name;
```

## Index Creation
```sql
-- ALWAYS use CONCURRENTLY for production indexes
CREATE INDEX CONCURRENTLY idx_users_email ON users (email);
```
- Never in a transaction (CONCURRENTLY cannot run inside one)

## Migration File Naming
```
20260401_001_add_users_display_name.sql
20260401_002_backfill_display_name.sql
```
- Timestamp prefix ensures ordering
- Descriptive suffix explains what changed

## Test on Copy First
1. `pg_dump` production schema (no data) to staging
2. Run migration on staging
3. Run application test suite against migrated staging
4. Only then apply to production

## Verification
- Migration runs in < 5 seconds on production-size data (or is batched)
- No `LOCK TABLE` or exclusive locks on hot tables
- Application works with both old AND new schema during rollout
- `pg_stat_activity` shows no long-running queries during migration
