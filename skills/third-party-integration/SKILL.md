---
name: third-party-integration
description: Use when integrating with a third-party API, handling external service rate limits, retries, auth flows, or building circuit breaker patterns
---

# Third-Party Integration

Integrate external APIs reliably. Assume they will fail, be slow, and change without notice.

## Preconditions

- API documentation reviewed
- Authentication credentials obtained
- Rate limits documented
- Fallback behavior defined for when API is unavailable

## Steps

### 1. Rate Limit Handling

Before calling:
- Check documented rate limits (requests/minute, requests/day)
- Implement token bucket or sliding window limiter
- Read `X-RateLimit-Remaining` headers from responses
- When approaching limit: queue requests, do not burst

When rate limited (429):
- Read `Retry-After` header
- Back off for specified duration
- Do NOT retry immediately

### 2. Authentication Flows

| Type | Implementation |
|------|---------------|
| API Key | Header: `Authorization: Bearer <key>` or query param |
| OAuth 2.0 | Token refresh before expiry, store refresh token securely |
| HMAC | Sign request body, include in header |

- Never log credentials or tokens
- Rotate keys on schedule (90 days max)
- Store in environment variables, never in code

### 3. Retry Strategy

```
Attempt 1: immediate
Attempt 2: wait 1s
Attempt 3: wait 4s (with jitter)
```

Retry on: 500, 502, 503, 429 (after Retry-After), network timeout.
Do NOT retry on: 400, 401, 403, 404, 422 (client errors are deterministic).

Add random jitter (0-500ms) to prevent thundering herd.

### 4. Circuit Breaker

Track failure rate over sliding window:
- **Closed** (normal): requests pass through
- **Open** (broken): all requests fail fast, return fallback
- **Half-open** (testing): allow 1 request through to test recovery

Thresholds:
- Open after 5 consecutive failures or > 50% failure rate in 60s
- Half-open after 30 seconds
- Close after 3 consecutive successes

### 5. Caching

Cache GET responses when data is not time-critical:
- Respect `Cache-Control` headers
- Default TTL: 5 minutes for volatile data, 1 hour for reference data
- Cache key: URL + relevant query params
- Stale-while-revalidate: serve cache, refresh in background

### 6. Fallbacks

Every external call needs a fallback:
- **Cached data**: serve last known good response
- **Degraded mode**: show partial data with "updating..." indicator
- **Default values**: reasonable defaults when data is non-critical
- **Error message**: clear user-facing message when no fallback possible

## Verification / Exit Criteria

- Rate limiter active before any API call
- Retry logic only fires on retryable errors (not 4xx client errors)
- Circuit breaker prevents cascading failures
- Fallback defined and tested for every external dependency
- No credentials in code or logs
