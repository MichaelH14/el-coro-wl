---
name: genesis
description: Create new agent, skill, or command with proper structure
arguments: "<type> <description> — type: agent, skill, command | description: what it does"
---

# /genesis

You have been invoked to create a new El Coro component.

## Workflow

Dispatch the `genesis` agent to handle creation.

1. **Parse Request** — Determine what to create:
   - **agent**: A new agent with frontmatter, iron rules, and anti-hallucination directives.
   - **skill**: A new skill file with proper structure.
   - **command**: A new slash command with frontmatter and instructions.

2. **Design Phase** — Before creating, define:
   - **Name**: Clear, descriptive, kebab-case.
   - **Purpose**: One sentence — what does it do?
   - **Triggers**: When should this be invoked?
   - **Inputs**: What does it need to work?
   - **Outputs**: What does it produce?
   - **Dependencies**: Other agents/skills it interacts with.

3. **Create — Agent** (if type is agent):
   - File: `agents/<name>.md`
   - Frontmatter: name, description, tools, model preference.
   - Iron rules: 3-5 non-negotiable rules for this agent.
   - Anti-hallucination: what this agent must NEVER assume or fabricate.
   - Workflow: step-by-step process.
   - Integration: how conductor routes to this agent.

4. **Create — Skill** (if type is skill):
   - File: `skills/<name>.md`
   - Frontmatter: name, description, triggers.
   - Instructions: detailed how-to for the skill.
   - Examples: at least 2 usage examples.

5. **Create — Command** (if type is command):
   - File: `commands/<name>.md`
   - Frontmatter: name, description, arguments.
   - Workflow: step-by-step what happens when invoked.
   - Rules: constraints and guardrails.
   - Agent/skill references: what handles the work.

6. **QA Gate Review** — qa-gate validates the new component:
   - Frontmatter is valid and complete.
   - No conflicts with existing components.
   - Naming is consistent with conventions.
   - Instructions are clear and actionable.
   - Integration points are correct.

7. **Report**:
   - Created: [type] "[name]" at [path].
   - Purpose: [one sentence].
   - Integration: how it connects to the rest of El Coro.
   - Test suggestion: how to verify it works.

## Rules
- ALWAYS run qa-gate on new components before declaring done.
- Names must be unique — check for conflicts with existing components.
- Every agent MUST have iron rules and anti-hallucination directives.
- Every command MUST reference the agent/skill that handles the work.
- Keep new components focused — one purpose per component.
