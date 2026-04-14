---
name: webhook-patterns
description: Use when implementing webhook delivery or consumption, including retry logic, idempotency, HMAC verification, or queue-based processing
---

# Webhook Patterns

Reliable webhook delivery and consumption. Handle failures gracefully, verify authenticity, process exactly once.

## Preconditions

- Webhook endpoint URL known (sender or receiver role)
- Signing secret configured for HMAC verification
- Queue system available for async processing (optional but recommended)

## Steps

### 1. Sending Webhooks

Delivery format:
```json
POST /webhook
Content-Type: application/json
X-Webhook-ID: "unique-uuid"
X-Webhook-Timestamp: "2026-03-31T12:00:00Z"
X-Webhook-Signature: "sha256=abc123..."

{
  "event": "draw.completed",
  "data": { ... },
  "webhook_id": "unique-uuid",
  "timestamp": "2026-03-31T12:00:00Z"
}
```

Every webhook has a unique ID for idempotency.

### 2. Retry with Exponential Backoff

On delivery failure (non-2xx response or timeout):

| Attempt | Delay |
|---------|-------|
| 1 | Immediate |
| 2 | 30 seconds |
| 3 | 2 minutes |
| 4 | 15 minutes |
| 5 | 1 hour |
| 6 | 4 hours |

After 6 failures: mark as dead, alert, stop retrying.
Timeout per attempt: 10 seconds max.

### 3. HMAC Signature Verification

Sender generates:
```javascript
const signature = crypto
  .createHmac('sha256', secret)
  .update(timestamp + '.' + JSON.stringify(body))
  .digest('hex');
```

Receiver verifies:
1. Extract timestamp and signature from headers
2. Reject if timestamp > 5 minutes old (replay protection)
3. Compute expected signature from body + secret
4. Timing-safe comparison (`crypto.timingSafeEqual`)
5. Reject if mismatch

### 4. Idempotency

Receiver must handle duplicate deliveries:
- Store processed `webhook_id` values (TTL: 7 days)
- Before processing, check if `webhook_id` already processed
- If duplicate: return 200 (acknowledge) but skip processing
- Use database unique constraint on webhook_id as safety net

### 5. Queue Processing

For high-volume webhooks:
1. Receive webhook, validate signature, return 200 immediately
2. Enqueue payload for async processing
3. Worker picks up from queue, processes, marks complete
4. If worker fails: message returns to queue for retry

Never do heavy processing in the webhook handler -- acknowledge fast, process later.

## Verification / Exit Criteria

- All outgoing webhooks include ID, timestamp, and HMAC signature
- Retry schedule follows exponential backoff (not aggressive polling)
- Receiver validates HMAC before processing payload
- Duplicate webhook_ids are detected and skipped
- Webhook handler responds within 5 seconds (heavy work queued)
