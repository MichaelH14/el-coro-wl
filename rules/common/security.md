# Security

Non-negotiable security standards for all El Coro projects.

## Input Validation at Boundaries

Validate ALL input at system boundaries: user input, API requests, webhook payloads, file uploads, query parameters.

**Why:** Trusting external input is the root cause of most security vulnerabilities. Validate at the gate, trust inside.

## Secrets Management

- Secrets go in environment variables, never in code
- Never commit secrets to git (use `.gitignore` for `.env` files)
- Never log secrets, even at debug level
- Rotate secrets regularly

```typescript
// Bad
const API_KEY = "sk-1234567890abcdef";

// Good
const API_KEY = process.env.API_KEY;
if (!API_KEY) throw new Error("API_KEY environment variable is required");
```

**Why:** A single committed secret can be scraped from git history forever, even after deletion. Prevention is the only cure.

## Dependency Security

- Run `npm audit` regularly
- Update dependencies on a schedule (not just when things break)
- Pin major versions to avoid surprise breaking changes
- Review changelogs before major updates

**Why:** Dependencies are attack surface you don't control. Known vulnerabilities in deps are the easiest path for attackers.

## No eval() or Dynamic Execution

Never use `eval()`, `new Function()`, or dynamic `require()`/`import()` with user-controlled input.

**Why:** Dynamic code execution with user input is remote code execution (RCE). It's the most severe class of vulnerability.

## HTTPS and CORS

- HTTPS everywhere, no exceptions
- CORS configured with explicit allowed origins (never `*` in production)
- Secure cookies: `httpOnly`, `secure`, `sameSite`

**Why:** HTTP exposes data in transit. Misconfigured CORS allows any site to make authenticated requests to your API.

## SQL Injection Prevention

Always use parameterized queries. Never concatenate user input into SQL strings.

```typescript
// Bad
const query = `SELECT * FROM users WHERE id = '${userId}'`;

// Good
const query = "SELECT * FROM users WHERE id = $1";
const result = await db.query(query, [userId]);
```

**Why:** SQL injection is the oldest and most exploited vulnerability class. Parameterized queries make it structurally impossible.
