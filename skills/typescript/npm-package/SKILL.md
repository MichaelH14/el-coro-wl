---
name: npm-package
description: Use when publishing an npm package, configuring package.json exports, managing semver versioning, or setting up the publish workflow
---

## Preconditions
- npm account with 2FA enabled
- Package compiles with TypeScript, outputs to `dist/`

## package.json Essential Fields
```json
{
  "name": "@scope/package-name",
  "version": "1.0.0",
  "type": "module",
  "main": "./dist/index.cjs",
  "module": "./dist/index.js",
  "types": "./dist/index.d.ts",
  "exports": {
    ".": {
      "import": { "types": "./dist/index.d.ts", "default": "./dist/index.js" },
      "require": { "types": "./dist/index.d.cts", "default": "./dist/index.cjs" }
    },
    "./utils": {
      "import": "./dist/utils.js",
      "require": "./dist/utils.cjs"
    }
  },
  "files": ["dist"],
  "sideEffects": false
}
```

## TypeScript Declarations
- `tsconfig.json`: `"declaration": true, "declarationMap": true`
- Use `tsup` or `unbuild` for dual CJS/ESM output with declarations
```ts
// tsup.config.ts
export default { entry: ['src/index.ts'], format: ['cjs', 'esm'], dts: true };
```

## Semantic Versioning
- MAJOR: breaking API changes
- MINOR: new features, backward compatible
- PATCH: bug fixes only
- Pre-release: `1.0.0-beta.1`

## Changelog
- Use `changesets` or `conventional-changelog`
- Every PR that changes behavior gets a changeset entry

## Publish Workflow
1. `npm run build` — compile to dist/
2. `npm pack --dry-run` — verify included files
3. `npx publint` — check package.json correctness
4. `npx arethetypeswrong` — verify types resolve for CJS and ESM
5. `npm publish --access public`

## Verification
- `npm pack --dry-run` shows only intended files
- `publint` reports no errors
- Consumers can `import` (ESM) and `require` (CJS) without issues
- Types resolve in both module systems
