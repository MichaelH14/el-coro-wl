---
name: design-references
description: Use when starting any UI/design work to check the user's saved design references and inspiration before designing from scratch
---

# Design References

Before designing ANYTHING, check for saved references.

## Preconditions
- UI or design work is about to begin
- designer agent is about to create a layout, component, or page

## Steps

1. **Check for project-specific references:**
   - Look in `{project}/.design-refs/` for screenshots, URLs, or notes
   - Look in `{project}/docs/design/` for any design docs
   
2. **Check for global references:**
   - Look in `~/.claude/design-refs/` for the user's saved inspirations
   - Each reference should have: screenshot/URL + what the user liked about it

3. **If references exist:**
   - designer agent MUST use them as starting point
   - Adapt the reference style to the current project
   - Don't copy 1:1 — extract the FEEL and apply it

4. **If no references exist:**
   - Ask the user: "Do you have a UI you like that I can reference? A URL or screenshot?"
   - If the user provides one → save to `.design-refs/` for next time
   - If the user says "just do it" → use modern, opinionated defaults (NOT generic)

5. **Always show options FIRST via Visual Companion:**
   - Before coding, show 2-3 directions in the browser
   - the user picks
   - THEN code

## Verification
- designer checked references before starting
- Visual Companion was offered for visual decisions
- The final UI doesn't look like a template
