# Git Workflow

Standards for version control across all El Coro projects.

## Conventional Commits

All commit messages follow the conventional commits format:

- `feat:` — new feature
- `fix:` — bug fix
- `docs:` — documentation only
- `refactor:` — code change that neither fixes a bug nor adds a feature
- `test:` — adding or updating tests
- `chore:` — maintenance, dependencies, tooling

```
feat: add user authentication via OAuth2
fix: resolve race condition in queue processor
refactor: extract validation logic into shared module
```

**Why:** Consistent commit messages enable automated changelogs, semantic versioning, and fast history scanning.

## Branch Naming

Descriptive branch names with type prefix:

- `feature/` — new functionality
- `fix/` — bug fixes
- `refactor/` — structural improvements

```
feature/user-dashboard
fix/memory-leak-websocket
refactor/extract-shared-validators
```

**Why:** Branch names communicate intent at a glance. Prefixes enable automation and filtering.

## Never Force Push to main/master

Force pushing to main/master is banned. No exceptions.

**Why:** Force push rewrites shared history. It breaks other developers' local state and can permanently lose commits.

## Never --no-verify

Git hooks exist for a reason. Never skip them with `--no-verify`.

**Why:** Hooks enforce quality gates (linting, tests, formatting). Skipping them means shipping known-bad code.

## Atomic Commits

One logical change per commit. If your commit message needs "and", it should be two commits.

```
# Bad
feat: add login page and fix database migration and update docs

# Good
feat: add login page with form validation
fix: correct column type in user migration
docs: update authentication setup guide
```

**Why:** Atomic commits make `git bisect` work, make reverts safe, and make history readable.

## Always Read Diff Before Committing

Run `git diff --staged` and review every line before committing. No blind commits.

**Why:** Catching accidental changes (debug logs, commented code, wrong files) before commit is 100x cheaper than after.
