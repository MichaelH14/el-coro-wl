# Error Handling

Standards for handling errors consistently and effectively.

## Explicit Errors with Context

Every error must include context: what operation failed, what input caused it, and why it failed. Never throw generic "Error".

```typescript
// Bad
throw new Error("Failed");
throw new Error("Invalid input");

// Good
throw new ValidationError(`User email "${email}" failed format validation: missing @ symbol`);
throw new DatabaseError(`Failed to insert user ${userId} into accounts table: unique constraint on email`);
```

**Why:** Generic errors require reading the stack trace and source code to understand. Contextual errors tell you everything at the point of failure.

## No Empty Try/Catch

Every catch block must either handle the error meaningfully or rethrow with added context. Empty catch blocks are banned.

```typescript
// Bad — silently swallows errors
try {
  await saveData(data);
} catch (e) {}

// Bad — logs but loses the error
try {
  await saveData(data);
} catch (e) {
  console.log("error");
}

// Good — handles or rethrows with context
try {
  await saveData(data);
} catch (error) {
  throw new PersistenceError(`Failed to save user data for ${data.userId}`, { cause: error });
}
```

**Why:** Swallowed errors are invisible failures. The system appears to work but data is lost, state is corrupt, and nobody knows.

## Structured Logging

All error logs must include structured context: what happened, where, and why.

```typescript
logger.error("Payment processing failed", {
  userId: user.id,
  amount: payment.amount,
  provider: "stripe",
  stripeErrorCode: error.code,
  operation: "charge_card",
});
```

**Why:** Unstructured logs are unsearchable. Structured logs enable filtering, alerting, and dashboards.

## Error Boundaries in React

Every major React component tree must have an error boundary that catches rendering errors and displays a fallback UI.

**Why:** An uncaught error in one component crashes the entire app. Error boundaries contain the blast radius.

## Graceful Shutdown

All services must handle SIGTERM and SIGINT signals to shut down gracefully: finish in-flight requests, close database connections, flush logs.

```typescript
process.on("SIGTERM", async () => {
  logger.info("SIGTERM received, starting graceful shutdown");
  await server.close();
  await database.disconnect();
  process.exit(0);
});
```

**Why:** Hard kills leave connections open, transactions incomplete, and data in inconsistent state. Graceful shutdown prevents all of this.

## Custom Error Classes

Create domain-specific error classes that extend Error. Each domain gets its own error type.

```typescript
class ValidationError extends Error {
  constructor(message: string, public readonly field: string) {
    super(message);
    this.name = "ValidationError";
  }
}

class NotFoundError extends Error {
  constructor(public readonly resource: string, public readonly id: string) {
    super(`${resource} with id ${id} not found`);
    this.name = "NotFoundError";
  }
}
```

**Why:** Custom error classes enable typed catch blocks, specific error handling, and clear error categorization in logs and monitoring.
