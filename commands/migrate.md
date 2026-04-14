---
name: migrate
description: Guide a migration with rollback plan and checkpoints
arguments: "<from> <to> — what you're migrating from and to (e.g., 'express fastify' or 'mongodb postgres')"
---

# /migrate

You have been invoked to guide a migration safely.

## Workflow

Dispatch the `migration-assistant` agent.

1. **Assessment** — Understand the migration scope.
   - What is being migrated: framework, database, API version, hosting, etc.
   - Inventory all affected files, configs, and dependencies.
   - Identify data that needs transforming or preserving.
   - Estimate complexity: small (< 10 files), medium (10-50), large (50+).

2. **Rollback Plan** — Create BEFORE touching anything.
   - Document exact steps to revert to the current state.
   - Create a git branch for the migration.
   - If database migration: document how to roll back schema changes.
   - If config migration: backup current configs.
   - Save rollback plan to `plans/rollback-<migration-name>.md`.

3. **Step-by-Step Execution** — Migrate incrementally with checkpoints.
   - Break migration into small, independently verifiable steps.
   - Each step has a checkpoint: verify it works before continuing.
   - Typical order:
     1. Add new dependency alongside old one.
     2. Create adapter/bridge layer.
     3. Migrate module by module.
     4. Remove old dependency.
   - At each checkpoint: run tests, verify functionality, check data integrity.

4. **Data Integrity** — If data is involved:
   - Verify row counts match before and after.
   - Spot-check specific records.
   - Verify all relationships/references are intact.

5. **Completion** — Final verification:
   - All tests pass with new system.
   - Build passes.
   - Performance is acceptable (not significantly degraded).
   - Rollback plan is archived (not deleted).

## Rules
- ALWAYS create rollback plan BEFORE starting migration.
- NEVER migrate everything at once — incremental steps with checkpoints.
- If any checkpoint fails, STOP and evaluate whether to continue or rollback.
- Keep the old system running in parallel until new system is verified.
