---
name: audit
description: "Full system health metrics — QA rates, accuracy, performance, tokens"
arguments: none
---

# /audit

You have been invoked to produce a comprehensive El Coro system audit.

## Workflow

This is the "how healthy is El Coro" command. Aggregate metrics from all subsystems.

1. **QA Gate Metrics**:
   - Total reviews this period.
   - Approval rate: X% PASS, Y% CONDITIONAL, Z% FAIL.
   - Most common failure reasons.
   - Average findings per review by severity.

2. **Sombra Accuracy**:
   - Predictions made: total count.
   - Correct predictions: count and percentage.
   - Per-domain accuracy breakdown.
   - Domains where accuracy is improving vs declining.

3. **Agent Performance** — Per agent:
   - Tasks completed: count.
   - Average completion time.
   - Success rate (tasks completed without error).
   - QA rejections (how often qa-gate rejected this agent's output).
   - Token usage.
   - Rank agents from most to least effective.

4. **Cortex Health**:
   - Total instincts: count.
   - Average confidence: score.
   - Instincts created this period.
   - Instincts promoted to rules.
   - Instincts deprecated or rolled back.

5. **Token Usage**:
   - Total tokens this period: Claude + Codex.
   - Cost estimate.
   - Tokens per task type.
   - Trend: increasing or decreasing.

6. **System Reliability**:
   - Uptime: time since last error or restart.
   - Error count this period.
   - Most common errors.
   - Mean time to recovery for incidents.

7. **Audit Report** — Present as executive summary:
   ```
   === EL CORO AUDIT ===
   QA Gate: 85% approval rate (12 reviews)
   Sombra: 72% prediction accuracy
   Top Agent: code-reviewer (95% success)
   Weakest Agent: [name] (60% success)
   Instincts: 24 active, avg confidence 0.65
   Tokens: 150K this week ($X.XX)
   Reliability: 99.5% uptime
   ```

## Rules
- Use actual data from state stores — do not estimate or fabricate metrics.
- If a metric is unavailable, say "NO DATA" rather than guessing.
- Flag any metric that indicates a systemic problem.
- This report should be the definitive source of truth for El Coro health.
