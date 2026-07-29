---
name: brainstorming
description: Use when the user wants to explore an idea, design a feature, or plan something before coding
---

# Brainstorming

Understand what the user wants, leverage what Sombra already knows, and propose approaches before touching code.

## Preconditions

- A request that involves creative decisions or multiple possible approaches
- Sombra's profile.json is accessible
- No code has been written yet for this task

## Steps

### 1. Understand the Request

Parse the request for:

- **Goal**: what is the end result?
- **Constraints**: timeline, tech stack, compatibility requirements
- **Implicit context**: which project, which codebase, existing patterns

Do NOT assume — if the goal is ambiguous, clarify. But only ask what Sombra doesn't already know.

### 2. Check Sombra's Profile

Query profile.json for relevant preferences:

- Tech stack preferences for this type of task
- Past decisions on similar features
- Known rejections (approaches the user has shot down before)
- Communication preference (brief options vs. detailed analysis)

Sombra's data reduces questions. If Sombra knows the user prefers React over Vue, don't ask.

### 3. Ask Only What's Unknown

If anything critical is still ambiguous after Sombra's data:

- Ask maximum 3 questions
- Frame questions as choices, not open-ended
- Include Sombra's best guess: "Based on your usual preference, I'd go with X — confirm?"

### 4. Propose 2-3 Approaches

For each approach:

- **Name**: one-line label
- **How**: brief implementation sketch (3-5 lines)
- **Pros**: what's good about this
- **Cons**: what's risky or costly
- **Effort**: rough estimate (hours/days)

### 5. Recommend One

Pick the best approach and explain why:

- Aligns with the user's known preferences
- Best trade-off of effort vs. quality
- Lowest risk given constraints

### 6. Get Approval

Present the recommendation. Wait for approval before proceeding. If the user picks a different approach, update Sombra's profile with this new data point.

## Visual Companion for Design Brainstorming

When brainstorming involves visual decisions (layouts, components, design directions), use the Visual Companion to show options in the browser. See skills/brainstorming/visual-companion.md for the full guide. Start the server with `${CLAUDE_PLUGIN_ROOT}/skills/brainstorming/scripts/start-server.sh --project-dir <project>` and push HTML content for the user to review and click.

## Verification / Exit Criteria

- the user approved an approach (explicit "tt", "dale", "si", or similar)
- Approach is documented (can be referenced later)
- Sombra's profile updated if new preference was revealed
- No code was written during brainstorming
- If the user seemed frustrated by questions: log feedback for Sombra
