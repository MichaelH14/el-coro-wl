---
name: git-worktrees
description: Use when starting feature work that needs isolation from the current workspace, or before executing implementation plans in a separate worktree
---

# Git Worktrees

Use git worktrees to isolate feature work from the main workspace.

## Preconditions

- Git repository initialized
- Main branch is clean (no uncommitted changes)
- Sufficient disk space for additional worktree

## Steps

### 1. Verify Clean State

Ensure the main worktree has no uncommitted changes. Stash or commit before creating a new worktree.

### 2. Select Directory

Choose worktree location:

- Convention: `../<repo-name>-<branch-name>/`
- Verify target directory does not already exist
- Verify parent directory is writable

### 3. Create Worktree

```bash
git worktree add ../<repo>-<feature-branch> -b <feature-branch>
```

### 4. Verify Worktree

- Confirm worktree is listed in `git worktree list`
- Confirm branch is correct
- Confirm files are present and intact

### 5. Work in Isolation

All feature work happens in the worktree. Main workspace remains on its original branch, unaffected.

### 6. Cleanup

After merging or abandoning:

```bash
git worktree remove ../<repo>-<feature-branch>
git branch -d <feature-branch>  # if merged
```

## Verification / Exit Criteria

- Worktree created at expected path
- Correct branch checked out in worktree
- Main workspace unchanged
- Worktree listed in `git worktree list`
- After cleanup: worktree removed, no dangling references
