---
name: rollback
description: Revert last instinct or rule learned by cortex
arguments: "[type] — 'instinct' (default) or 'rule'"
---

# /rollback

You have been invoked to revert the last learning made by cortex.

## Workflow

1. **Identify Target** — Determine what to rollback.
   - If type is "instinct" (or unspecified): find the most recently created/modified instinct.
   - If type is "rule": find the most recently promoted rule.
   - Show the target to the user before proceeding:
     - Name, description, confidence, created date.
     - Ask for confirmation: "Rollback this? (y/n)"

2. **Archive** — Preserve before removing.
   - Move the instinct/rule to an archive directory (NOT delete).
   - Archive filename includes: original name + rollback date.
   - Record reason for rollback (ask the user or use "manual rollback").

3. **Remove from Active** — Take it out of the active system.
   - If instinct: remove from cortex active instincts.
   - If rule: remove from rules system, revert to instinct if appropriate.
   - Update any references or triggers that depended on this item.

4. **Verify** — Confirm removal.
   - Check active instincts/rules list — target should be gone.
   - Check archive — target should be present.
   - Verify no broken references.

5. **Report**:
   - Rolled back: [name] ([type]).
   - Was active since: [date].
   - Archived to: [path].
   - Impact: what behavior changes with this rollback.
   - To restore: instructions to un-archive if needed.

## Rules
- ALWAYS archive before removing — never permanently delete learnings.
- ALWAYS confirm with the user before rolling back.
- If the item was a rule promoted from an instinct, offer to demote back to instinct instead of full removal.
- Log rollback in the audit trail.
