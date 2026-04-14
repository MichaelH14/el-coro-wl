# Performance

Standards for building fast, efficient systems.

## Never Block the Event Loop

All I/O operations must be async. Never use synchronous file reads, synchronous HTTP requests, or CPU-heavy computation on the main thread.

```typescript
// Bad
const data = fs.readFileSync("/path/to/file");

// Good
const data = await fs.promises.readFile("/path/to/file");
```

**Why:** A blocked event loop means zero requests served until the blocking operation completes. One slow read can freeze your entire server.

## Lazy Loading

Heavy modules and rarely-used features should be loaded on demand, not at startup.

```typescript
// Bad — loads heavy module even if never used
import { heavyProcessor } from "./heavy-processor";

// Good — loads only when needed
async function processIfNeeded(data: Data) {
  const { heavyProcessor } = await import("./heavy-processor");
  return heavyProcessor(data);
}
```

**Why:** Startup time directly affects deployment speed, cold starts, and developer experience. Load what you need when you need it.

## Connection Pooling

All database connections must use connection pools. Never open a new connection per request.

**Why:** Connection creation is expensive (TCP handshake, auth, TLS). Pools amortize this cost and prevent connection exhaustion under load.

## Pagination Required

All list endpoints must support pagination. No endpoint returns unbounded result sets.

```typescript
// Required parameters for all list endpoints
interface PaginationParams {
  page: number;    // or cursor: string
  limit: number;   // with a max cap (e.g., 100)
}
```

**Why:** Unbounded queries grow with data. An endpoint returning 10 rows today might return 10 million next year and take down the database.

## Cache Expensive Computations

Results of expensive operations (complex queries, external API calls, heavy calculations) must be cached with appropriate TTL.

**Why:** Recomputing the same result wastes CPU, increases latency, and burns through API rate limits. Cache the result, serve it fast.

## Stream Large Files

Large files must be streamed, never buffered entirely in memory.

```typescript
// Bad — loads entire file into memory
const file = await fs.promises.readFile("large-file.csv");
processEntireFile(file);

// Good — processes in chunks
const stream = fs.createReadStream("large-file.csv");
stream.pipe(csvParser).on("data", processRow);
```

**Why:** Buffering a 2GB file requires 2GB of RAM. Streaming requires only the buffer size. This is the difference between running and crashing.
