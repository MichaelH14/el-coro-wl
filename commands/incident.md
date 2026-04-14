---
name: incident
description: Start incident response runbook — detect, diagnose, fix, post-mortem
arguments: "[service] — affected service name (optional, auto-detects if possible)"
---

# /incident

You have been invoked to handle a production incident.

## Workflow

Use the incident-response skill. This is a HIGH PRIORITY operation.

1. **Detection** — Assess the situation:
   - What service is affected? (specified or auto-detect from recent errors).
   - What are the symptoms? (errors, timeouts, crashes, data issues).
   - When did it start? (check logs, metrics, deploy history).
   - What's the blast radius? (one service, multiple, all users?).
   - **Severity**:
     - SEV1: Service completely down, all users affected.
     - SEV2: Service degraded, some users affected.
     - SEV3: Minor issue, workaround available.

2. **Diagnosis** — Find the root cause FAST:
   - Check recent deploys (last deploy before incident started?).
   - Check logs for errors and stack traces.
   - Check system resources (CPU, memory, disk — is something maxed?).
   - Check external dependencies (APIs, databases, DNS).
   - Check for config changes.

3. **Mitigation** — Stop the bleeding:
   - If recent deploy caused it: ROLLBACK immediately.
   - If resource exhaustion: restart service, clear cache, scale up.
   - If external dependency: activate fallback or circuit breaker.
   - If data corruption: stop writes, assess damage.
   - Goal: restore service FIRST, root cause analysis SECOND.

4. **Fix** — Apply permanent fix:
   - Once service is stable, apply a proper fix for the root cause.
   - Test the fix thoroughly.
   - Deploy with extra monitoring.

5. **Post-Mortem** — Document what happened:
   - Timeline: when detected, when mitigated, when resolved.
   - Root cause: what went wrong and why.
   - Impact: users affected, duration, data loss (if any).
   - Action items: what to do to prevent recurrence.
   - Save to `incidents/` directory.

## Rules
- SPEED is priority during mitigation — fix fast, analyze later.
- Rollback is ALWAYS preferable to debugging in production during SEV1.
- NEVER delete logs during an incident — they're evidence.
- Post-mortem is REQUIRED, even for SEV3 incidents.
