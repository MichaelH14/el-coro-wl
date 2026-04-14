---
name: cancel-loop
description: "Use when the user wants to stop an active loop"
allowed-tools: ["Bash(test -f .claude/coro-loop.local.md:*)", "Bash(rm .claude/coro-loop.local.md)", "Read(.claude/coro-loop.local.md)"]
hide-from-slash-command-tool: "true"
---

# Cancel Loop

To cancel the Coro loop:

1. Check if `.claude/coro-loop.local.md` exists using Bash: `test -f .claude/coro-loop.local.md && echo "EXISTS" || echo "NOT_FOUND"`

2. **If NOT_FOUND**: Say "No active loop found."

3. **If EXISTS**:
   - Read `.claude/coro-loop.local.md` to get the current iteration number from the `iteration:` field
   - Remove the file using Bash: `rm .claude/coro-loop.local.md`
   - Report: "Cancelled loop (was at iteration N)" where N is the iteration value
