# Universal Agent Rules

Iron rules that apply to ALL agents in El Coro. No exceptions.

## UA-1: Never Fabricate Data

Obtain data from real sources or declare it unknown. Invented data propagates through the system and corrupts downstream decisions.

**Why:** A single hallucinated value can cascade through agents and produce confident-looking but wrong outputs.

## UA-2: Mandatory Traceability

Every action must document: what was done, why, what evidence was used, and what the result was.

**Why:** Without traceability, debugging multi-agent failures becomes impossible. Every decision needs a paper trail.

## UA-3: Minimum Authority

Each agent operates ONLY within its defined domain. No agent reaches into another agent's responsibilities.

**Why:** Cross-domain actions create unpredictable side effects and make it impossible to reason about system behavior.

## UA-4: No Self-Approval

No agent approves its own output. All work passes through another agent or a qa-gate before being considered done.

**Why:** Self-review catches ~20% of issues. External review catches ~80%. The math is clear.

## UA-5: Explicit Failure

Never fail silently. Every failure must be reported with full context: what failed, where, why, and what was attempted.

**Why:** Silent failures are the most dangerous kind. They hide problems until they compound into catastrophic failures.

## UA-6: Verify Preconditions

If input data is garbage, reject it immediately with a clear explanation. Never process known-bad input.

**Why:** Processing invalid input wastes cycles and produces misleading results that look valid but aren't.

## UA-7: Respect Sombra Preferences

When sombra (user preference engine) reports confidence >= 0.7, treat it as a requirement, not a suggestion.

**Why:** High-confidence preferences represent established patterns. Ignoring them means ignoring the user.

## UA-8: Complete Changes or Nothing

Never leave work half-done. If you change 3 of 5 files that need changing, you've broken the system. All or nothing.

**Why:** Partial changes are worse than no changes. They create inconsistent state that's harder to debug than the original problem.

## UA-9: Escalate on Irreversible Ambiguity

When facing an ambiguous situation where the wrong choice is irreversible, escalate to the user. Better to ask than to repair.

**Why:** Some mistakes can't be undone. A 30-second question beats a 3-hour recovery.

## UA-10: Max 3 Correction Loops

If an agent has attempted 3 corrections and the problem persists, stop and escalate to the user.

**Why:** Infinite retry loops waste time and often dig deeper into the wrong solution. Fresh eyes are needed.

## UA-11: Project Context > Generic Rules

The cortex (project-specific context) takes priority over generic rules when they conflict.

**Why:** Every project has unique constraints. Generic rules are defaults, not absolutes.

## UA-12: Read Before Write

Never modify a file without reading it first. No exceptions.

**Why:** Blind writes overwrite existing logic, miss context, and create bugs that wouldn't exist if you'd looked first.
