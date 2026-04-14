---
name: ts-patterns
description: Use when writing TypeScript code that needs generics, utility types, type guards, discriminated unions, template literals, or conditional types
---

## Preconditions
- TypeScript 5.x project with `strict: true` in tsconfig.json

## Generics
```ts
function getProperty<T, K extends keyof T>(obj: T, key: K): T[K] {
  return obj[key];
}
```

## Utility Types
- `Partial<T>` — all optional
- `Required<T>` — all required
- `Pick<T, K>` / `Omit<T, K>` — subset of keys
- `Record<K, V>` — map keys to values
- `ReturnType<F>` / `Parameters<F>` — extract from functions

## Type Guards
```ts
function isUser(val: unknown): val is User {
  return typeof val === 'object' && val !== null && 'id' in val;
}
```

## Discriminated Unions
```ts
type Result =
  | { status: 'ok'; data: string }
  | { status: 'error'; message: string };

function handle(r: Result) {
  if (r.status === 'ok') return r.data; // narrowed
}
```

## Template Literal Types
```ts
type EventName = `on${Capitalize<'click' | 'focus'>}`; // 'onClick' | 'onFocus'
```

## Conditional Types
```ts
type IsArray<T> = T extends any[] ? true : false;
type Unwrap<T> = T extends Promise<infer U> ? U : T;
```

## Verification
- Run `tsc --noEmit` — zero errors
- No `any` unless explicitly justified with `// eslint-disable-next-line`
- Prefer `unknown` over `any` at boundaries
