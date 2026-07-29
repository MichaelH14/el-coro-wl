---
name: skill-creation
description: Use when a workflow gap is identified in El Coro and a new skill needs to be created to codify it
---

# Skill Creation

Create a new skill to codify a missing workflow in El Coro.

## Preconditions

- A workflow gap has been identified (no existing skill covers it)
- Skill registry reviewed to confirm no overlap
- Genesis has write access to skills/ directory
- Target domain directory exists (system/ or workflow/)

## Steps

### 1. Identify the Need

Document the missing workflow:

- What task required manual orchestration that should be automated?
- What sequence of steps keeps being repeated without a skill?
- Which agents need this workflow to do their jobs better?

### 2. Define the Skill

- **Name**: lowercase-kebab-case (e.g., `database-migration`)
- **Domain**: system (infrastructure/meta) or workflow (development process)
- **Trigger**: when should this skill be invoked?
- **Scope**: what this skill covers and what it explicitly does NOT

### 3. Write Preconditions

List everything that must be true before the skill can execute:

- Required files/directories
- Required state (e.g., "branch is clean")
- Required tools/access
- Required agent availability

### 4. Write Execution Steps

Each step must be:

- **Numbered** and in execution order
- **Specific**: not "do the thing" but "run `npm test` in project root"
- **Conditional**: include if/else for common failure modes
- **Bounded**: include timeouts or limits where applicable

Target: 5-10 steps. If more than 15, decompose into sub-skills.

### 5. Write Verification / Exit Criteria

Define how to know the skill completed successfully:

- What must be true after execution?
- What files should exist or have changed?
- What commands should pass?
- What should NOT have changed?

### 6. Create Skill File

Write to `skills/<domain>/<skill-name>/SKILL.md` with frontmatter:

```yaml
---
name: skill-name
description: Brief description of when to trigger this skill
---
```

### 7. Submit to qa-gate

qa-gate reviews for: completeness, no overlap, clear exit criteria, reasonable step count.

### 8. Log Creation

Record in state store:

```json
{
  "skill": "skill-name",
  "domain": "workflow",
  "gap_identified": "description",
  "created": "2026-03-31",
  "reviewed_by": "qa-gate",
  "status": "active"
}
```

## Verification / Exit Criteria

- SKILL.md exists at correct path with valid frontmatter
- Has preconditions, steps, and verification sections
- Steps are numbered, specific, and bounded
- No overlap with existing skills (qa-gate verified)
- Creation logged in state store
- Skill file is 30-80 lines (concise but complete)
