---
name: query-optimization
description: Use when a query is slow, investigating N+1 problems, analyzing EXPLAIN output, or optimizing database performance with indexes or materialized views
---

## Preconditions
- PostgreSQL (concepts apply to MySQL/SQLite with adaptation)
- Access to `EXPLAIN ANALYZE` on a staging copy of production data

## EXPLAIN ANALYZE
```sql
EXPLAIN (ANALYZE, BUFFERS, FORMAT TEXT)
SELECT u.*, COUNT(o.id) FROM users u
LEFT JOIN orders o ON o.user_id = u.id
GROUP BY u.id;
```
Key signals:
- **Seq Scan** on large table = missing index
- **Nested Loop** with high actual rows = consider Hash Join
- **Sort** with external merge = increase `work_mem`
- **Buffers shared read** high = data not cached, slow disk

## Index Strategy
- Index columns in WHERE, JOIN ON, ORDER BY
- Composite index: put equality columns first, range columns last
- Partial index for filtered queries: `WHERE active = true`
- Cover index: include all SELECT columns to avoid heap lookup
- Drop unused: check `pg_stat_user_indexes` for `idx_scan = 0`

## N+1 Detection
```ts
// BAD: N+1
const users = await db.query('SELECT * FROM users');
for (const u of users) {
  u.orders = await db.query('SELECT * FROM orders WHERE user_id = $1', [u.id]);
}
// GOOD: single query with JOIN or IN
const users = await db.query(`
  SELECT u.*, json_agg(o.*) as orders FROM users u
  LEFT JOIN orders o ON o.user_id = u.id GROUP BY u.id
`);
```
- ORM: use `include`/`with`/eager loading

## Connection Pooling
- Pool size = (cores * 2) + effective_spindle_count
- Too many connections = context switching overhead
- Use PgBouncer for serverless / high-connection-count apps

## Prepared Statements
```ts
// node-postgres: automatic with parameterized queries
await pool.query('SELECT * FROM users WHERE id = $1', [userId]);
```

## Materialized Views
```sql
CREATE MATERIALIZED VIEW monthly_stats AS
  SELECT date_trunc('month', created_at) AS month, COUNT(*) FROM orders GROUP BY 1;
REFRESH MATERIALIZED VIEW CONCURRENTLY monthly_stats;
```
- Use for expensive aggregations read often, updated rarely

## Verification
- No query > 100ms in application logs (p95)
- EXPLAIN shows Index Scan on all large-table queries
- No N+1 patterns in ORM query logs
- Connection pool utilization < 80% under load
