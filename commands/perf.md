---
name: perf
description: Performance profiling — memory, queries, event loop, bundle size
arguments: "[scope] — specific area to profile (optional, defaults to full project)"
---

# /perf

You have been invoked to profile and identify performance issues.

## Workflow

Dispatch the `performance-profiler` agent.

1. **Memory Analysis**
   - Identify potential memory leaks: event listeners not removed, growing arrays/maps, unclosed connections.
   - Check for large objects held in closures unnecessarily.
   - Verify streams are properly closed/destroyed.
   - Flag any in-memory caching without eviction strategy.

2. **Query Analysis** (if database involved)
   - Identify N+1 query patterns (queries inside loops).
   - Check for missing indexes on frequently queried fields.
   - Flag unbounded queries (no LIMIT, fetching all records).
   - Look for redundant queries (same data fetched multiple times).

3. **Event Loop Analysis** (Node.js)
   - Identify synchronous operations that block the event loop.
   - Check for CPU-intensive operations not offloaded to workers.
   - Flag `fs.readFileSync` and similar blocking calls in request handlers.
   - Verify async operations use proper error handling.

4. **Bundle Size Analysis** (if frontend)
   - Check bundle size and identify largest contributors.
   - Flag unnecessary dependencies (large libs used for small features).
   - Verify tree-shaking is working (no unused exports in bundle).
   - Check for duplicate dependencies in bundle.

5. **General Patterns**
   - Unnecessary re-renders (React) or re-computations.
   - Missing caching where appropriate (HTTP cache headers, memoization).
   - Inefficient algorithms (O(n^2) where O(n) is possible).
   - Excessive logging in hot paths.

6. **Report** — Findings with estimated impact:
   - **HIGH IMPACT**: Fixes that will noticeably improve performance.
   - **MEDIUM IMPACT**: Worth doing in next refactor cycle.
   - **LOW IMPACT**: Micro-optimizations, do when convenient.
   - Each finding: location, current behavior, suggested improvement, estimated gain.

## Rules
- Focus on MEASURABLE improvements, not premature optimization.
- Always suggest fixes, not just problems.
- Prioritize user-facing performance over internal operations.
- If no significant issues found, say so — don't invent problems.
