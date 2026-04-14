# Coding Style

Standards for clean, maintainable code across all El Coro projects.

## Immutability Preferred

Create new objects instead of mutating existing ones. Use spread operators, `Object.freeze`, and immutable patterns.

**Why:** Mutation is the #1 source of hard-to-trace bugs. Immutable data is predictable and safe to pass around.

## File Size Limits

- Files: < 300 lines
- Functions: < 50 lines

If a file or function exceeds these limits, it's doing too much. Split it.

**Why:** Small units are easier to read, test, and maintain. Large files hide complexity and discourage understanding.

## Descriptive Names

- No abbreviations (except universally understood ones like `id`, `url`, `http`)
- No single-letter variables (except `i`, `j`, `k` in loop indices)
- Names should read like documentation

```typescript
// Bad
const d = getUsrData(u);
const res = proc(d);

// Good
const userData = getUserData(userId);
const processedResult = processUserData(userData);
```

**Why:** Code is read 10x more than it's written. Saving 5 characters costs 5 minutes of comprehension every time someone reads it.

## No `any` in TypeScript

Never use `any`. Use `unknown` with type guards if the type is genuinely uncertain.

**Why:** `any` disables the type system. Every `any` is a hole in your safety net that bugs will fall through.

## Early Returns

Prefer early returns over nested conditionals. Reduce nesting, increase clarity.

```typescript
// Bad
function process(input: Input) {
  if (input.isValid) {
    if (input.hasData) {
      // actual logic buried 2 levels deep
    }
  }
}

// Good
function process(input: Input) {
  if (!input.isValid) return;
  if (!input.hasData) return;
  // actual logic at top level
}
```

**Why:** Nested conditionals create cognitive load. Early returns make the happy path obvious.

## Variable Declarations

- `const` by default for everything
- `let` only when reassignment is genuinely needed
- `var` is banned, never use it

**Why:** `const` communicates intent ("this won't change") and prevents accidental reassignment. `var` has broken scoping rules that cause bugs.
