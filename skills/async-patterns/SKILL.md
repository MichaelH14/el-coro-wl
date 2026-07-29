---
name: async-patterns
description: Use when working with async code that needs Promise combinators, concurrency control, retry logic, cancellation, or async iterators
---

## Preconditions
- Node.js 20+ or modern browser
- Understand: every `await` yields to event loop

## Promise.all vs Promise.allSettled
```ts
// all: fails fast on first rejection
const [users, orders] = await Promise.all([getUsers(), getOrders()]);

// allSettled: waits for all, never rejects
const results = await Promise.allSettled([taskA(), taskB()]);
results.forEach((r) => {
  if (r.status === 'fulfilled') use(r.value);
  else logError(r.reason);
});
```

## Concurrency Limiting
```ts
import pLimit from 'p-limit';
const limit = pLimit(5); // max 5 concurrent
const results = await Promise.all(
  urls.map((url) => limit(() => fetch(url)))
);
```

## Retry with Exponential Backoff
```ts
async function retry<T>(fn: () => Promise<T>, maxAttempts = 3): Promise<T> {
  for (let i = 0; i < maxAttempts; i++) {
    try { return await fn(); }
    catch (err) {
      if (i === maxAttempts - 1) throw err;
      await sleep(Math.pow(2, i) * 1000);
    }
  }
  throw new Error('unreachable');
}
```

## Cancellation with AbortController
```ts
const controller = new AbortController();
setTimeout(() => controller.abort(), 5000); // 5s timeout
const res = await fetch(url, { signal: controller.signal });
```
- Pass `signal` through to nested calls
- Check `signal.aborted` in loops

## Async Iterators
```ts
async function* paginate(url: string) {
  let cursor: string | null = null;
  do {
    const { data, nextCursor } = await fetchPage(url, cursor);
    yield data;
    cursor = nextCursor;
  } while (cursor);
}

for await (const page of paginate('/api/items')) {
  process(page);
}
```

## Error Propagation
- Always `await` or `.catch()` — never fire-and-forget promises
- Use `Promise.allSettled` when partial failure is acceptable
- Wrap top-level with `process.on('unhandledRejection')` as safety net

## Verification
- No floating promises (eslint: `no-floating-promises`)
- Concurrency bounded for bulk operations
- Timeouts set for all external calls
