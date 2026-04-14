---
name: dependency-update
description: Use when updating npm dependencies, running security audits, or upgrading to a major version of a package
---

# Dependency Update

Keep dependencies current without breaking things. Test before and after every update.

## Preconditions

- npm project with package.json and package-lock.json
- Test suite that covers core functionality
- Git working tree clean (commit or stash changes first)

## Steps

### 1. Audit Current State

```bash
npm audit          # security vulnerabilities
npm outdated       # available updates
```

Categorize updates:
- **Security fixes** (from npm audit): do immediately
- **Patch versions** (1.0.x): safe, update in batch
- **Minor versions** (1.x.0): usually safe, test after
- **Major versions** (x.0.0): breaking changes likely, update one at a time

### 2. Safe Update Flow

For each update:

```bash
# Step 1: Verify tests pass BEFORE update
npm test

# Step 2: Update dependency
npm update package-name      # minor/patch
npm install package-name@latest  # major

# Step 3: Verify tests pass AFTER update
npm test

# Step 4: Commit if tests pass
git add package.json package-lock.json
git commit -m "chore: update package-name to vX.Y.Z"
```

One commit per dependency update (easy to revert if problems emerge later).

### 3. Major Version Updates

Major versions require extra care:
1. Read the changelog/migration guide
2. Search codebase for deprecated APIs: `grep -r "deprecatedFunction" src/`
3. Update the dependency
4. Fix all breaking changes
5. Run full test suite
6. Manual smoke test of affected features
7. Commit with description of migration steps

### 4. Batch Updates

For multiple patch/minor updates:
```bash
npm update  # updates all within semver range
npm test    # verify nothing broke
```

If tests fail after batch update:
- Reset: `git checkout -- package.json package-lock.json && npm ci`
- Update dependencies one at a time to find the culprit

### 5. Lock File Hygiene

- ALWAYS commit package-lock.json
- Use `npm ci` in CI/CD (not `npm install`)
- If lock file conflicts in merge: delete lock file, run `npm install`, verify, commit

### 6. Update Schedule

- Security vulnerabilities: same day
- Patch updates: weekly batch
- Minor updates: bi-weekly
- Major updates: evaluate monthly, schedule individually

## Verification / Exit Criteria

- npm audit shows 0 critical and 0 high vulnerabilities
- All tests pass after updates
- package-lock.json committed with changes
- Major version updates have migration steps documented in commit
- No deprecated API usage remaining after major updates
