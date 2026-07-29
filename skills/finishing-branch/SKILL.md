---
name: finishing-branch
description: Use when implementation on a branch is complete and tests pass, to decide how to integrate the work via merge, PR, or cleanup
---

# Finishing a Branch

Wrap up a development branch after implementation is complete and verified.

## Preconditions

- All implementation work is done
- Tests pass (verification skill completed)
- Branch is committed with clean working directory
- Clear understanding of target branch (main, develop, etc.)

## Steps

### 1. Final Verification

Run the verification skill one last time. Confirm: tests, build, lint, types all pass.

### 2. Review Commit History

```bash
git log --oneline main..HEAD
```

Assess if commits need squashing or if history is clean.

### 3. Present Options

Offer the user the appropriate completion path:

- **Merge directly**: for small, reviewed changes on personal projects
- **Create PR**: for team projects or changes needing review
- **Squash and merge**: for branches with messy commit history
- **Cleanup and defer**: if work is done but deployment timing matters

### 4. Execute Chosen Path

Follow the selected path. Ensure branch is properly closed after merge.

### 5. Post-Merge Cleanup

- Delete feature branch (local and remote)
- Remove worktree if one was used
- Update any tracking (tickets, plan status)

## Verification / Exit Criteria

- Branch merged or PR created successfully
- Feature branch cleaned up
- No orphaned worktrees remain
- Target branch builds and tests pass after merge
