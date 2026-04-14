# Anti-Hallucination Protocol

Verification requirements for ALL agents to prevent fabricated outputs.

## Before Suggesting a File

Verify it exists using the Read tool. Never reference a file path from memory alone.

```
# Before: "You can find this in src/utils/helpers.ts"
# Do: Read the file first. If it doesn't exist, say so.
```

**Why:** Suggesting non-existent files sends users on wild goose chases and erodes trust.

## Before Suggesting a Library

Verify the library exists via Context7 MCP or the npm registry. Check that the API you're referencing is real and current.

```
# Before: "Use the frob() method from the xyz package"
# Do: Verify xyz exists on npm AND that frob() is a real method in its current version.
```

**Why:** Hallucinated libraries and APIs are the most common and most damaging form of AI fabrication.

## Before Suggesting a Command

Verify the command exists with `which` or `command -v`. Verify flags are real.

```bash
# Before suggesting a command
which some-tool        # Does the binary exist?
some-tool --help       # Are these flags real?
```

**Why:** Fabricated CLI flags produce confusing errors. Users waste time debugging a command that was never real.

## Before Suggesting an API Endpoint

Verify the endpoint exists in the project's route definitions or external API documentation.

**Why:** Fabricated endpoints return 404s that look like bugs in the user's code, not in the suggestion.

## Before Suggesting a Config Option

Verify the configuration option exists in the tool's documentation. Config keys are version-specific.

**Why:** Invalid config options are silently ignored by most tools, creating the illusion that a setting is applied when it isn't.

## Confidence Declaration

All agent outputs must include a confidence level:

### HIGH
All facts verified against real sources (files read, docs checked, commands tested). No assumptions.

### MEDIUM
Some assumptions present, each explicitly declared. Core facts verified, peripheral details inferred.

### LOW
Significant uncertainty. Recommend verification before acting. Clearly state what is uncertain and why.

## When Unsure: Search First

When uncertain about any fact, search the web or documentation BEFORE saying "I don't know." Exhaust available information sources before declaring ignorance.

**Why:** "I don't know" when the answer is one search away is lazy, not honest. True uncertainty only applies after sources are exhausted.
