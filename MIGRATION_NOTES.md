# Svelte 5 Migration Notes

## Scope

Migration from Svelte 4 to Svelte 5 with minimal compatibility-focused changes, without enabling global runes mode.

Branch: `chore/svelte5-migration`

## Version Changes

- `svelte`: `^4.2.19` -> `^5.53.5`
- `@sveltejs/kit`: `^2.0.0` -> `^2.53.2`
- `@sveltejs/vite-plugin-svelte`: `^3.0.0` -> `^6.2.4`
- `vite`: `^5.0.3` -> `^6.4.1`
- `vitest`: `^2.1.8` -> `^4.0.18`
- `bits-ui`: `^0.22.0` -> `^2.16.2`
- `@internationalized/date`: added `^3.11.0` (peer dependency for newer `bits-ui`)

## Migration Script

- Attempted to run the official migrator: `npx sv migrate svelte-5`
- Result: CLI could not complete in this non-interactive environment due prompt flow (`Continue?`, folder selection).
- Action taken: applied minimal manual compatibility fixes where needed to restore execution flow.

## Code Fixes Applied

1. Svelte self-closing tag compatibility:
   - `src/lib/components/directus/section/tabs/tabs.svelte`
   - Replaced non-void self-closing `<div />` with `<div></div>`.

2. Bits UI v2 scroll-area compatibility:
   - `src/lib/components/ui/modal/modal-body.svelte`
   - `src/lib/components/ui/modal/index.ts`
   - Replaced `ScrollArea.Content` usage with a plain `<div>` inside `ScrollArea.Viewport` and adjusted prop typing to `HTMLAttributes<HTMLDivElement>`.

3. Broken Directus imports causing build-time module errors:
   - `src/lib/directus/index.ts`
   - Switched imports to local directus query/type modules (`./pageRequest`, `./hotelRequests`, etc.) where expected exports exist.

## Commands Executed

```bash
git checkout -b chore/svelte5-migration
pnpm add -D svelte@^5 @sveltejs/kit@latest @sveltejs/vite-plugin-svelte@latest vite@latest
pnpm add -D vite@^6
pnpm add -D bits-ui@latest
pnpm add vaul-svelte@latest @internationalized/date@latest
npx sv migrate svelte-5
pnpm dev
pnpm add -D vitest@latest
pnpm run test:unit
pnpm check
```

## Validation Results

- `pnpm dev`: starts successfully on Vite 6 + Svelte 5.
- `pnpm run test:unit`: runs on Vitest 4; current failures are assertion/data-level in existing tests (`src/lib/directus/tours/tours.test.ts`), not startup/toolchain failures.
- `pnpm check`: reports many TypeScript/Svelte issues, including existing/refactor-related problems and submodule-origin typing noise; not all are introduced by this migration.

## Build-Skipped Steps (per request)

- `SKIPPED_BUILD_STEP`: `pnpm build` (explicitly skipped on instruction).
- `SKIPPED_BUILD_STEP`: `pnpm test` (skipped because `test:integration` runs Playwright with `npm run build && npm run preview` in `playwright.config.ts`).
- `SKIPPED_BUILD_STEP`: `pnpm run test:integration` (indirect build dependency).

## Remaining Risks

1. `vaul-svelte@0.3.2` still pulls an older `bits-ui` peer chain and reports Svelte `<5` peer expectation.
2. Project has broad pre-existing typing issues (`pnpm check`) in parent code and submodule-linked codepaths.
3. Official `sv migrate svelte-5` transformations were not fully auto-applied due interactive CLI constraints.

## Notes

- No submodule source files were edited.
- Lockfile priority remained with `pnpm-lock.yaml`.
