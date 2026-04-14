# TypeScript Coding Style

TypeScript-specific standards that extend the common coding style rules.

## Strict Mode Always

Every tsconfig.json must have `"strict": true`. No exceptions, no partial strict options.

```json
{
  "compilerOptions": {
    "strict": true
  }
}
```

**Why:** Strict mode enables all type-checking flags at once. Partial strict is a false sense of safety — you either have type safety or you don't.

## No `any` — Use `unknown`

When the type is genuinely uncertain, use `unknown` with a type guard. Never use `any`.

```typescript
// Bad
function process(data: any) {
  return data.name; // no type checking at all
}

// Good
function process(data: unknown) {
  if (isUser(data)) {
    return data.name; // type-safe after guard
  }
  throw new ValidationError("Expected User object");
}
```

**Why:** `any` propagates through the type system like a virus. One `any` infects every function it touches and disables all type checking downstream.

## Prefer Interfaces Over Types

Use `interface` for object shapes. Reserve `type` for unions, intersections, and mapped types.

```typescript
// Use interface for object shapes
interface User {
  id: string;
  name: string;
  email: string;
}

// Use type for unions and intersections
type Result = Success | Failure;
type UserWithRole = User & { role: Role };
```

**Why:** Interfaces are extendable, produce better error messages, and are the idiomatic choice for object shapes in TypeScript.

## Discriminated Unions for Complex State

Model complex state with discriminated unions, not optional fields.

```typescript
// Bad — unclear which fields exist in which state
interface Request {
  status: string;
  data?: ResponseData;
  error?: Error;
  retryCount?: number;
}

// Good — each state is explicit and type-safe
type Request =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "success"; data: ResponseData }
  | { status: "error"; error: Error; retryCount: number };
```

**Why:** Optional fields create ambiguous states (is `data` undefined because it's loading or because there was an error?). Discriminated unions make impossible states unrepresentable.

## Proper Generics

Generics should be constrained enough to be useful but not so specific they prevent reuse.

```typescript
// Too loose — T could be anything
function first<T>(arr: T[]): T { ... }

// Too specific — hardcoded to User
function first(arr: User[]): User { ... }

// Right — constrained but flexible
function first<T extends { id: string }>(arr: T[]): T { ... }
```

**Why:** Unconstrained generics provide no type information. Over-constrained generics can't be reused. Find the balance.

## `as const` for Literal Types

Use `as const` for objects and arrays that should have literal types, not widened types.

```typescript
// Without as const — type is { role: string }
const config = { role: "admin" };

// With as const — type is { readonly role: "admin" }
const config = { role: "admin" } as const;
```

**Why:** `as const` preserves literal types, enabling precise type checking and exhaustive pattern matching.

## Exhaustive Switch with `never`

When switching on a discriminated union, use `never` in the default case to catch unhandled variants at compile time.

```typescript
function handleRequest(req: Request): string {
  switch (req.status) {
    case "idle": return "Waiting";
    case "loading": return "Loading...";
    case "success": return req.data.message;
    case "error": return req.error.message;
    default: {
      const _exhaustive: never = req;
      return _exhaustive; // compile error if a case is missing
    }
  }
}
```

**Why:** Without exhaustive checking, adding a new variant to a union silently leaves switch statements incomplete. `never` turns this into a compile-time error.
