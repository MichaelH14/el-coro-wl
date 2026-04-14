---
name: express-patterns
description: Use when building Express.js APIs, writing middleware, configuring routes, handling errors, or implementing graceful shutdown
---

## Preconditions
- Express 4.x or 5.x
- TypeScript with `@types/express`

## Middleware Chain
```ts
// Order matters: parse -> auth -> route -> error
app.use(express.json({ limit: '1mb' }));
app.use(cors(corsOptions));
app.use(authMiddleware);
app.use('/api/v1', router);
app.use(errorHandler); // must be last, must have 4 params
```

## Error Handling Middleware
```ts
const errorHandler: ErrorRequestHandler = (err, req, res, next) => {
  const status = err.statusCode ?? 500;
  const message = status === 500 ? 'Internal Server Error' : err.message;
  if (status === 500) logger.error(err);
  res.status(status).json({ error: message });
};
```
- Always wrap async routes: `asyncHandler(fn)` or use express 5 native support

## Router Organization
```
routes/
  users.ts    -> /api/v1/users
  orders.ts   -> /api/v1/orders
  health.ts   -> /health
```

## Request Validation (Zod)
```ts
const createUserSchema = z.object({
  body: z.object({ email: z.string().email(), name: z.string().min(1) }),
});
const validate = (schema: ZodSchema) => (req, res, next) => {
  const result = schema.safeParse(req);
  if (!result.success) return res.status(400).json({ errors: result.error.flatten() });
  next();
};
```

## Response Formatting
```ts
const ok = <T>(res: Response, data: T) => res.json({ ok: true, data });
const fail = (res: Response, status: number, msg: string) =>
  res.status(status).json({ ok: false, error: msg });
```

## Graceful Shutdown
```ts
const server = app.listen(PORT);
process.on('SIGTERM', () => {
  server.close(() => { db.end(); process.exit(0); });
  setTimeout(() => process.exit(1), 10_000); // force after 10s
});
```

## Verification
- Every async route wrapped or Express 5 used
- Error middleware registered last with 4 parameters
- No `res.send()` after `res.json()` — single response per request
