---
name: security-scan
description: Use when reviewing code for security vulnerabilities, checking dependencies for CVEs, auditing for leaked secrets, or running OWASP top 10 checks
---

# Security Scan

Systematic security review. Check OWASP top 10, dependency vulnerabilities, leaked secrets, input handling.

## Preconditions

- Codebase accessible for review
- npm/node project with package-lock.json
- Git history available for secrets scanning

## Steps

### 1. Dependency Audit

```bash
npm audit
```

- Fix critical and high vulnerabilities immediately
- Review moderate vulnerabilities (fix if easy, document if not)
- Low severity: batch into next maintenance cycle
- If `npm audit fix` introduces breaking changes, update manually

### 2. Secrets Detection

Scan for leaked secrets in code and git history:

Patterns to detect:
- API keys: strings matching `[A-Za-z0-9]{32,}` near "key", "token", "secret"
- Passwords: hardcoded strings in auth/config files
- Connection strings: `postgres://`, `mongodb://`, `redis://` with credentials
- Private keys: `-----BEGIN (RSA|EC|OPENSSH) PRIVATE KEY-----`
- .env files committed to git

Check git history (secrets removed from HEAD may still be in history):
```bash
git log --all --diff-filter=D -- "*.env"
git log --all -p -- "*.env"
```

If secret found in history: rotate the credential immediately, then clean history.

### 3. OWASP Top 10 Checklist

| # | Risk | Check |
|---|------|-------|
| 1 | Broken Access Control | Auth on every protected route, RBAC enforced |
| 2 | Cryptographic Failures | HTTPS only, bcrypt for passwords, no MD5/SHA1 |
| 3 | Injection | Parameterized queries, no string concatenation in SQL |
| 4 | Insecure Design | Rate limiting, account lockout, input validation |
| 5 | Security Misconfiguration | No default credentials, error messages don't leak info |
| 6 | Vulnerable Components | npm audit clean, dependencies up to date |
| 7 | Auth Failures | Strong passwords, MFA where possible, session timeouts |
| 8 | Data Integrity | Verify webhooks (HMAC), validate file uploads |
| 9 | Logging Failures | Auth events logged, sensitive data never logged |
| 10 | SSRF | No user-controlled URLs in server-side requests |

### 4. Input Validation Audit

For every user-facing endpoint:
- Is input validated with schema (Zod/joi)?
- Are SQL queries parameterized?
- Is HTML output escaped (XSS prevention)?
- Are file uploads validated (type, size, content)?

Flag any endpoint that processes user input without validation.

### 5. Report

Output findings as:
```json
{
  "scan_date": "2026-03-31",
  "critical": [],
  "high": [],
  "medium": [],
  "low": [],
  "passed_checks": ["dependency_audit", "secrets_scan", ...]
}
```

## Verification / Exit Criteria

- npm audit shows 0 critical and 0 high vulnerabilities
- No secrets found in code or git history
- All OWASP top 10 items checked with pass/fail
- Every user input endpoint has validation
- Findings documented with severity and remediation steps
