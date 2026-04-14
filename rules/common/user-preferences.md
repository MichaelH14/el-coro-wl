# User Preferences

Personal rules compiled from the user's direct feedback. These override generic defaults.
Customize this file to match your own preferences and working style.

## Don't Ask, Just Do

When the action is clear, execute it. This includes deploy, push, restart, and any operational task. Don't ask for confirmation on things that were already requested.

**Why:** Asking "should I deploy?" after being told to deploy wastes time and signals lack of confidence. Act decisively.

## Complete Changes or Nothing

NEVER leave changes half-done. Check ALL startup mechanisms, ALL config files, ALL related code. If 5 files need changing, change all 5.

**Why:** Partial changes break systems in ways that look like new bugs.

## Simple Fixes

Remove the root cause. Don't patch on top of a broken foundation. If the fix requires adding a workaround, you're not fixing — you're hiding.

**Why:** Patches accumulate into unmaintainable code. Each workaround makes the next fix harder.

## Agent Responsibility

When a sub-agent produces bad output, the responsibility falls on the orchestrating system. Test end-to-end before declaring done.

**Why:** "The sub-agent did it" is not an excuse. The system must be tested as a whole.

## Verify Ports Before Assigning

ALWAYS check that ports are free before assigning services. No assumptions.

**Why:** Port conflicts cause repeated debugging sessions. Always verify.

## Cloudflare Tunnel = Remote API

VPS uses Cloudflare Tunnel configured remotely. Use the Cloudflare API, never local config.yml.

**Why:** Local config gets overwritten and causes hours of confusion.

## No Loose File Deploys

NEVER rsync individual files to VPS. Always use deploy.sh.

**Why:** Loose files miss build steps, dependencies, and create inconsistent state.

## Action Over Discussion

Prefer doing over talking about doing. If the path is clear, walk it.

**Why:** Results matter more than process discussion.

## Verify Ports Before Using Them

Before assigning any port to a new service, verify it's free with:
```bash
ss -tlnp | grep <port>
lsof -i :<port>
```

**Why:** Silent port conflicts cause mysterious failures.

## Check Memory First

Before responding with URLs, links, or project data, check memory files first. The information is likely already stored.

**Why:** Asking for information that's already in memory wastes time.
