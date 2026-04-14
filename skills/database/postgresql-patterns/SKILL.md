---
name: postgresql-patterns
description: Use when writing PostgreSQL queries, designing indexes, using JSONB, CTEs, full-text search, window functions, or analyzing query plans with EXPLAIN
---

## Preconditions
- PostgreSQL 15+
- Client: `pg` (node-postgres) or Prisma/Drizzle ORM

## Indexes
```sql
-- B-tree (default): equality and range queries
CREATE INDEX idx_users_email ON users (email);
-- Partial index: only index what you query
CREATE INDEX idx_active_users ON users (email) WHERE active = true;
-- GIN: JSONB containment, array overlap, full-text
CREATE INDEX idx_metadata ON products USING GIN (metadata);
-- GiST: geometry, range types, nearest-neighbor
CREATE INDEX idx_location ON places USING GIST (coordinates);
```

## JSONB Operations
```sql
-- Query nested field
SELECT * FROM events WHERE metadata->>'type' = 'click';
-- Containment (uses GIN index)
SELECT * FROM events WHERE metadata @> '{"source": "web"}';
-- Update nested value
UPDATE events SET metadata = jsonb_set(metadata, '{processed}', 'true');
```

## CTEs (Common Table Expressions)
```sql
WITH monthly_totals AS (
  SELECT date_trunc('month', created_at) AS month, SUM(amount) AS total
  FROM orders GROUP BY 1
)
SELECT month, total, total - LAG(total) OVER (ORDER BY month) AS delta
FROM monthly_totals;
```

## Full-Text Search
```sql
ALTER TABLE articles ADD COLUMN search_vector tsvector
  GENERATED ALWAYS AS (to_tsvector('english', title || ' ' || body)) STORED;
CREATE INDEX idx_search ON articles USING GIN (search_vector);
SELECT * FROM articles WHERE search_vector @@ plainto_tsquery('english', 'search terms');
```

## Window Functions
```sql
SELECT name, department, salary,
  RANK() OVER (PARTITION BY department ORDER BY salary DESC) AS dept_rank,
  AVG(salary) OVER (PARTITION BY department) AS dept_avg
FROM employees;
```

## EXPLAIN ANALYZE
```sql
EXPLAIN (ANALYZE, BUFFERS, FORMAT TEXT) SELECT ...;
```
- Look for: Seq Scan on large tables (needs index), Nested Loop with high rows, Sort exceeding work_mem

## Connection Pooling
- Use PgBouncer or built-in pool (`pg` pool, Prisma connection pool)
- Transaction mode for serverless, session mode for prepared statements
- Max connections: `max_connections` in postgres.conf, pool size < that

## Verification
- No Seq Scan on tables > 10K rows in EXPLAIN output
- JSONB queries use GIN indexes (check with EXPLAIN)
- Connection pool configured, not opening new connections per request
