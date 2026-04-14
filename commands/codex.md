---
name: codex
description: Delegate a task to Codex (GPT) for execution
arguments: <task> — description of the task to delegate
---

# /codex

You have been invoked to delegate a task to Codex CLI (GPT).

## Workflow

1. **Task Preparation** — Format the task for Codex.
   - Parse the task description.
   - Identify which files Codex will need to read/modify.
   - Determine if this task is suitable for Codex:
     - GOOD for Codex: boilerplate, repetitive code, simple implementations, tests, documentation.
     - BAD for Codex: complex architecture, security-sensitive code, code that needs deep project context.

2. **Code Sanitization** — Before sending context to Codex:
   - NEVER send API keys, tokens, passwords, or secrets.
   - NEVER send `.env` file contents.
   - Strip sensitive config values, replace with placeholders.
   - Only send the files relevant to the task.

3. **Delegation** — Send to Codex via CLI:
   - Format the prompt with clear instructions, input files, and expected output.
   - Include relevant type definitions and interfaces for context.
   - Specify the output format (file paths, code blocks, etc.).

4. **Receive and Review** — When Codex returns results:
   - qa-gate agent reviews ALL Codex output before integration.
   - Check for: correctness, style consistency, security issues, hallucinated APIs.
   - If output is bad, retry with more specific prompt (max 2 retries).

5. **Integration** — Apply Codex output to the project:
   - Apply changes to the correct files.
   - Run linter to fix style issues.
   - Run tests to verify correctness.
   - If tests fail, fix the issues (Codex output is a starting point, not gospel).

6. **Report** — Summary:
   - Task delegated: description.
   - Codex result: accepted/rejected/modified.
   - Files changed.
   - Token savings estimate: what it would have cost on Claude vs Codex.

## Rules
- NEVER send secrets or credentials to Codex.
- ALWAYS run qa-gate on Codex output — trust but verify.
- If Codex output fails qa-gate twice, do it with Claude instead.
- Track token usage for the /tokens report.
