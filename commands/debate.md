---
name: debate
description: Start architectural debate between specialist agents
arguments: <topic> — the architectural question or decision to debate
---

# /debate

You have been invoked to facilitate an architectural debate.

## Workflow

Conductor spawns relevant specialist agents to argue positions with evidence.

1. **Frame the Debate** — Define the question clearly:
   - Parse the topic into a specific decision with clear options.
   - Example: "REST vs GraphQL for [Product Name] API" becomes:
     - Option A: REST with OpenAPI spec.
     - Option B: GraphQL with Apollo Server.
   - If more than 3 options, narrow to the top 3.

2. **Spawn Debaters** — Select relevant agents:
   - `architect`: System design perspective, scalability, maintainability.
   - `api-designer`: API usability, developer experience, documentation.
   - `database-reviewer`: Data access patterns, query efficiency, schema impact.
   - `security-reviewer`: Security implications of each option.
   - Select agents based on the topic — not all are needed for every debate.

3. **Argument Phase** — Each agent presents their case:
   - For each option, the relevant agent argues:
     - **Pros**: Concrete benefits with evidence (not vague claims).
     - **Cons**: Concrete drawbacks with evidence.
     - **Context**: When this option is best/worst.
     - **Evidence**: Links to docs, benchmarks, real-world examples.
   - Agents can respond to each other's points (one round of rebuttals).

4. **Vote** — Each agent votes:
   - Their preferred option with a one-sentence justification.
   - Confidence level: strong preference, slight preference, neutral.

5. **Synthesis** — Conductor summarizes:
   - Consensus option (if agents agree).
   - Key arguments for and against.
   - Recommendation with rationale.
   - If NO consensus: present the split clearly and escalate to the user for the final call.

6. **Decision Record** — Save the debate outcome:
   - Save to `decisions/` directory.
   - Include: question, options, arguments, votes, decision, date.

## Rules
- Arguments must include EVIDENCE, not just opinions.
- Each agent argues from their domain expertise, not general preference.
- If consensus is reached, present it as recommendation (the user still decides).
- If no consensus, clearly present the split — do NOT force agreement.
