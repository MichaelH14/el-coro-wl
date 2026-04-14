# TypeScript Patterns

## Functional Over Class-Based
- Prefer arrow functions and composition over class hierarchies
- Use closures for encapsulation instead of private members
- **Why:** Functional code is easier to test, compose, and reason about

## Early Returns
- Return early to avoid nesting — max 2 levels of indentation
- Guard clauses at the top of functions
- **Why:** Deep nesting makes code harder to follow and maintain

## Barrel Exports
- Use sparingly — only for public API boundaries
- Never re-export everything from deeply nested modules
- **Why:** Over-barreling causes circular dependencies and bloated bundles

## Async/Await
- Always async/await, never raw callbacks
- Use `Promise.all()` for parallel, `Promise.allSettled()` when partial failure is OK
- Handle errors explicitly — no unhandled promise rejections
- Use `AbortController` for cancellation
- **Why:** Callbacks create pyramid of doom; unhandled rejections crash Node.js

## Error Types
- Custom error classes extending `Error` for each domain
- Include context: what failed, why, what was the input
- Never `throw new Error("something went wrong")` — be specific
- **Why:** Generic errors are impossible to handle programmatically

## Graceful Shutdown
- Listen for `SIGTERM` and `SIGINT`
- Close DB connections, flush logs, stop accepting new requests
- Exit with code 0 after cleanup
- **Why:** Hard kills lose in-flight work and corrupt state

## Environment Validation
- Validate ALL env vars at startup with `zod`
- Fail fast if required vars are missing
- Type the validated config object
- **Why:** Runtime env errors at 3am are worse than startup crashes

## Readonly by Default
- Use `readonly` arrays and objects where mutation isn't needed
- `as const` for literal type inference
- `Readonly<T>` and `ReadonlyArray<T>` for function parameters
- **Why:** Accidental mutation is the source of the hardest bugs to track
