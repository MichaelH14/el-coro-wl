---
name: monorepo-patterns
description: Use when setting up or working within a monorepo, configuring workspaces, sharing packages between projects, or orchestrating builds across packages
---

## Preconditions
- pnpm (preferred) or npm 7+ workspaces
- Project has 2+ packages that share code

## Workspace Setup (pnpm)
```yaml
# pnpm-workspace.yaml
packages:
  - 'packages/*'
  - 'apps/*'
```
```
monorepo/
  apps/
    web/          # Next.js app
    api/          # Express API
  packages/
    shared/       # shared types + utils
    ui/           # component library
    config/       # eslint, tsconfig bases
```

## Shared Packages
```json
// packages/shared/package.json
{ "name": "@repo/shared", "main": "./src/index.ts" }
```
- Reference via workspace protocol: `"@repo/shared": "workspace:*"`
- Export types and utilities, never platform-specific code

## Build Orchestration
- Use `turbo` (Turborepo) for task caching and parallel execution
```json
// turbo.json
{ "tasks": {
  "build": { "dependsOn": ["^build"], "outputs": ["dist/**"] },
  "dev": { "cache": false, "persistent": true },
  "test": { "dependsOn": ["build"] }
}}
```

## Dependency Hoisting
- pnpm: strict by default (no phantom deps) — best for correctness
- npm: hoists everything — can cause phantom dependency issues
- Shared devDependencies (eslint, typescript) go in root `package.json`

## Versioning Strategy
- Internal packages: no versioning, always `workspace:*`
- Published packages: use changesets (`@changesets/cli`)
- `npx changeset` -> `npx changeset version` -> `npx changeset publish`

## CI/CD
- Use Turborepo remote cache to skip unchanged packages
- Run affected-only: `turbo run test --filter=...[origin/main]`
- Each app has its own deploy pipeline, shared packages are build deps

## Verification
- `pnpm install` succeeds from clean state
- `turbo run build` builds all packages in correct order
- No circular dependencies between packages
- Shared package changes trigger downstream rebuilds
