---
name: security
description: Full security scan — OWASP, deps, secrets, input validation
arguments: "[scope] — specific files or directory to scan (optional, defaults to entire project)"
---

# /security

You have been invoked to perform a comprehensive security review.

## Workflow

Dispatch the `security-reviewer` agent.

1. **Dependency Scan**
   - Run `npm audit` (or equivalent) and report vulnerabilities.
   - Check for outdated packages with known CVEs.
   - Flag any dependency that hasn't been updated in 12+ months.

2. **Secrets Detection**
   - Scan all files for hardcoded secrets: API keys, tokens, passwords, connection strings.
   - Check `.env` files are in `.gitignore`.
   - Verify no secrets in git history (`git log -p` for sensitive patterns).
   - Check for secrets in comments or documentation.

3. **OWASP Top 10 Review**
   - Injection (SQL, NoSQL, command, LDAP).
   - Broken authentication and session management.
   - Sensitive data exposure (logging PII, unencrypted storage).
   - XML external entities (if applicable).
   - Broken access control (missing auth checks on routes).
   - Security misconfiguration (default credentials, debug mode in prod).
   - Cross-Site Scripting (XSS) — if frontend.
   - Insecure deserialization.
   - Using components with known vulnerabilities.
   - Insufficient logging and monitoring.

4. **Input Validation**
   - All user inputs validated and sanitized.
   - File uploads restricted by type and size.
   - Rate limiting on sensitive endpoints.
   - CORS configured correctly (not wildcard in production).

5. **Report** — Categorized findings:
   - **CRITICAL**: Exploitable vulnerabilities. Must fix immediately.
   - **HIGH**: Significant risk. Fix before next deploy.
   - **MEDIUM**: Should address soon.
   - **LOW**: Best practice improvements.
   - Each finding includes: location, description, remediation steps.

## Rules
- Security findings are NEVER downgraded below WARNING.
- CRITICAL findings block deployment — report to the user immediately.
- Do NOT fix security issues silently — always report what was found.
- When in doubt, classify higher severity (better safe than sorry).
