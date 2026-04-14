---
name: loop
description: "Use when the user wants to run a prompt repeatedly on an interval or iterate autonomously on a task"
argument-hint: "PROMPT [--max-iterations N] [--completion-promise TEXT]"
allowed-tools: ["Bash(${CLAUDE_PLUGIN_ROOT}/hooks/scripts/setup-coro-loop.sh:*)"]
hide-from-slash-command-tool: "true"
---

# Coro Loop Command

Execute the setup script to initialize the Coro loop:

```!
"${CLAUDE_PLUGIN_ROOT}/hooks/scripts/setup-coro-loop.sh" $ARGUMENTS
```

Please work on the task. When you try to exit, the Coro loop will feed the SAME PROMPT back to you for the next iteration. You'll see your previous work in files and git history, allowing you to iterate and improve.

CRITICAL RULE: If a completion promise is set, you may ONLY output it when the statement is completely and unequivocally TRUE. Do not output false promises to escape the loop, even if you think you're stuck or should exit for other reasons. The loop is designed to continue until genuine completion.
