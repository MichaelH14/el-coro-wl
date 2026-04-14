---
name: load-testing
description: Use when stress testing a service, establishing performance baselines, or measuring system capacity under concurrent load
---

# Load Testing

Measure system capacity before users do. Establish baselines, test concurrency, find breaking points.

## Preconditions

- Application deployed to test environment (not production)
- Load testing tool available (k6, autocannon, or ab)
- Baseline metrics defined (response time, throughput)
- Monitoring active during tests (CPU, memory, DB connections)

## Steps

### 1. Establish Baseline

Before any optimization, measure current performance:

```bash
# Using autocannon (Node.js)
npx autocannon -c 10 -d 30 http://localhost:3000/api/health
```

Record:
- **p50 latency**: median response time
- **p95 latency**: 95th percentile (most users' experience)
- **p99 latency**: 99th percentile (worst case)
- **Throughput**: requests per second
- **Error rate**: percentage of non-2xx responses

### 2. Concurrency Testing

Gradually increase concurrent users:

| Connections | Expected |
|-------------|----------|
| 10 | Baseline performance |
| 50 | Slight degradation ok |
| 100 | Should still respond |
| 500 | Find the ceiling |

```bash
# k6 script
import http from 'k6/http';
import { check } from 'k6';

export const options = {
  stages: [
    { duration: '1m', target: 10 },   // ramp up
    { duration: '3m', target: 50 },   // sustained
    { duration: '1m', target: 100 },  // peak
    { duration: '1m', target: 0 },    // ramp down
  ],
};

export default function () {
  const res = http.get('http://test-host:3000/api/draws');
  check(res, { 'status 200': (r) => r.status === 200 });
}
```

### 3. Stress Test (Find Breaking Point)

Push beyond expected load until failures appear:
- Increase connections until error rate > 1%
- Record the breaking point (max concurrent users before degradation)
- Identify the bottleneck: CPU, memory, DB connections, or network

Common bottlenecks:
- **Database**: too many connections, slow queries
- **Memory**: leaks under sustained load
- **CPU**: unoptimized code paths, sync operations
- **Network**: bandwidth or connection limits

### 4. Endpoint Benchmarks

Test each critical endpoint individually:

| Endpoint | Target p95 | Target RPS |
|----------|-----------|------------|
| GET /health | < 10ms | 1000+ |
| GET /api/draws | < 100ms | 500+ |
| POST /api/tickets | < 200ms | 100+ |
| GET /api/results/:id | < 50ms | 500+ |

Adjust targets per product -- lottery result checks have higher traffic than admin endpoints.

### 5. Report and Compare

After testing, document:
```json
{
  "test_date": "2026-03-31",
  "environment": "staging",
  "baseline_p95_ms": 45,
  "peak_concurrent": 200,
  "breaking_point": 350,
  "bottleneck": "database_connections",
  "max_rps": 800,
  "error_rate_at_peak": "0.5%"
}
```

Compare against previous test to detect regressions.

## Verification / Exit Criteria

- Baseline performance recorded with p50/p95/p99
- Concurrency test completed with ramp-up pattern
- Breaking point identified and documented
- Bottleneck identified (CPU/memory/DB/network)
- Results compared against previous benchmark
- No load tests run against production
