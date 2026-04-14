---
name: tokens
description: Token usage report — Claude vs Codex, costs, optimization
arguments: none
---

# /tokens

You have been invoked to report on token usage and cost efficiency.

## Workflow

Read from the token tracking store and present usage analytics.

1. **Session Usage** — Current session breakdown:
   - Claude tokens used: input + output.
   - Codex tokens used: input + output (if any tasks were delegated).
   - Total tokens this session.

2. **Per-Agent Breakdown** — Token usage by agent:
   - List each agent that was active this session.
   - Tokens consumed per agent.
   - Rank from most to least expensive.
   - Flag any agent using disproportionately many tokens.

3. **Cost Analysis**:
   - Estimated cost this session (based on model pricing).
   - Claude vs Codex cost comparison for delegated tasks.
   - Savings from Codex delegation (if applicable).
   - Cost per task type: review, debug, deploy, etc.

4. **Historical Trends** (if data available):
   - Token usage over last 7 days.
   - Average tokens per session.
   - Most expensive recurring operations.
   - Trend: increasing, stable, or decreasing usage.

5. **Optimization Recommendations**:
   - Tasks that could be delegated to Codex to save tokens.
   - Agents that might be doing unnecessary work (verbose output, redundant checks).
   - Caching opportunities (repeated analysis on unchanged files).
   - Prompt optimization suggestions (shorter context, focused scope).

6. **Summary**:
   ```
   === TOKEN REPORT ===
   Session: X tokens (Claude: Y, Codex: Z)
   Top agent: [name] — X tokens
   Estimated cost: $X.XX
   Savings from Codex: $X.XX
   Recommendation: [one-liner]
   ```

## Rules
- Report actual numbers, not estimates (except cost which is always estimated).
- Flag sessions where token usage seems unusually high.
- Codex delegation should be recommended when it saves >50% on a task type.
- Keep the report concise — this is a quick check, not an audit.
