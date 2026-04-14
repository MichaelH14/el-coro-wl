---
name: node-patterns
description: Use when working with Node.js runtime internals like the event loop, streams, worker threads, cluster mode, or signal handling
---

## Preconditions
- Node.js 20+ LTS
- Understand: Node is single-threaded for JS, but I/O is async via libuv

## Event Loop
- Phases: timers -> pending callbacks -> idle/prepare -> poll -> check -> close
- `setImmediate` runs in check phase (after I/O), `setTimeout(fn, 0)` in timers
- `process.nextTick` runs between phases — use sparingly, can starve I/O

## Streams
```ts
import { pipeline } from 'node:stream/promises';
import { createReadStream, createWriteStream } from 'node:fs';
import { createGzip } from 'node:zlib';

await pipeline(
  createReadStream('input.txt'),
  createGzip(),
  createWriteStream('output.gz')
);
```
- Readable: data source. Writable: data sink. Transform: both.
- Always use `pipeline()` — handles backpressure and error propagation

## Worker Threads (CPU-bound)
```ts
import { Worker } from 'node:worker_threads';
const worker = new Worker('./heavy-task.js', { workerData: payload });
worker.on('message', (result) => { /* done */ });
worker.on('error', (err) => { /* handle */ });
```

## Cluster Module
```ts
import cluster from 'node:cluster';
import { availableParallelism } from 'node:os';
if (cluster.isPrimary) {
  for (let i = 0; i < availableParallelism(); i++) cluster.fork();
  cluster.on('exit', (w) => cluster.fork()); // replace dead workers
} else {
  startServer();
}
```

## Signal Handling
```ts
const shutdown = async () => {
  server.close();
  await db.end();
  process.exit(0);
};
process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);
```

## Verification
- No unhandled promise rejections: `process.on('unhandledRejection', ...)`
- Streams: confirm backpressure handled (no `.pipe()` without error handling)
- Workers: confirm `worker.terminate()` called on shutdown
