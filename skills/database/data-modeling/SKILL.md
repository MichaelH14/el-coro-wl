---
name: data-modeling
description: Use when designing database schemas, defining table relationships, choosing normalization strategy, or working with state store patterns
---

# Data Modeling

Design database schemas that are correct, queryable, and maintainable. Normalize first, denormalize only when measured.

## Preconditions

- Requirements or feature spec available
- Target database system known (PostgreSQL default)
- Existing schema understood (if extending)

## Steps

### 1. Entity Identification

From requirements, identify:
- **Entities**: nouns that need persistence (users, tickets, games, draws)
- **Relationships**: how entities connect (user HAS MANY tickets)
- **Attributes**: properties of each entity (user.email, ticket.severity)

### 2. Normalize to 3NF

Apply normalization:
- **1NF**: no repeating groups, atomic values
- **2NF**: no partial dependencies (every non-key depends on full primary key)
- **3NF**: no transitive dependencies (non-key depends only on key)

Default to 3NF. Only denormalize if query performance demands it AND you have EXPLAIN ANALYZE proof.

### 3. Naming Conventions

- Tables: plural, snake_case (`support_tickets`, `lottery_draws`)
- Columns: singular, snake_case (`created_at`, `user_id`)
- Primary keys: `id` (bigint, auto-increment or UUID)
- Foreign keys: `{referenced_table_singular}_id` (`user_id`, `draw_id`)
- Booleans: `is_` or `has_` prefix (`is_active`, `has_paid`)
- Timestamps: `_at` suffix (`created_at`, `updated_at`, `deleted_at`)
- Indexes: `idx_{table}_{columns}` (`idx_users_email`)

### 4. Relationship Patterns

**One-to-Many**: FK on the "many" side.
```sql
CREATE TABLE tickets (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  user_id BIGINT NOT NULL REFERENCES users(id),
  ...
);
```

**Many-to-Many**: junction table with composite unique constraint.
```sql
CREATE TABLE user_roles (
  user_id BIGINT NOT NULL REFERENCES users(id),
  role_id BIGINT NOT NULL REFERENCES roles(id),
  PRIMARY KEY (user_id, role_id)
);
```

**Soft delete**: `deleted_at TIMESTAMPTZ NULL` instead of actual DELETE.

### 5. State Store Patterns

For El Coro's state store:
- Every table has `id`, `created_at`, `updated_at`
- JSON columns for flexible metadata: `metadata JSONB DEFAULT '{}'`
- Enum-like values as TEXT with CHECK constraint (not actual ENUMs -- hard to migrate)
- Partition large tables by date if > 10M rows expected

### 6. Review Checklist

Before finalizing:
- [ ] Every table has a primary key
- [ ] All foreign keys have indexes
- [ ] No data duplication across tables (unless intentional denormalization)
- [ ] Timestamps present (created_at minimum)
- [ ] Naming conventions followed consistently
- [ ] Nullable columns are intentionally nullable (default NOT NULL)

## Verification / Exit Criteria

- Schema is in 3NF (or documented reason for denormalization)
- All relationships have proper foreign keys and indexes
- Naming conventions applied consistently
- State store patterns followed for El Coro tables
- Schema reviewed against query patterns (can the expected queries run efficiently?)
