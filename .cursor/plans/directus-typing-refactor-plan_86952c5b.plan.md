---
name: directus-typing-refactor-plan
overview: Refactor plan to enforce strict Directus boundaries, remove legacy duplication, and align routes/data/domain layers for static SSG. Plan is based on current repo structure and identifies concrete file-by-file moves and typing/validation patterns.
todos:
  - id: phase1-routes
    content: Move misplaced routes from src/lib/[backtoroutes] to src/routes and fix imports.
    status: completed
  - id: phase2-directus-infra
    content: Consolidate Directus client/utils to src/lib/infrastructure/directus; remove duplicates.
    status: completed
  - id: phase3-domain-typing
    content: Create per-domain query schemas, mappers, and view models; update loaders.
    status: completed
  - id: phase4-components
    content: Replace component props with view models; remove $cms/$lib/directus imports.
    status: completed
  - id: phase5-cleanup
    content: Delete redundant files and verify no submodule edits.
    status: completed
---

# Refactor Plan — Directus Typing + Boundaries

## A) Executive summary

- Directus access is split between `src/lib/directus/` (legacy) and `src/lib/infrastructure/directus/`; consolidate to a single infrastructure entrypoint and remove legacy usage.
- Components currently import raw Directus schemas (`$lib/directus/*` and `$cms/*`); replace with app-owned view models and domain types.
- `src/lib/[backtoroutes]/ `contains route-like code misplaced under `$lib`; migrate to `src/routes/` without changing URLs.
- Strengthen data flow: query types → Zod validate → map to view models before components.
- Align `app.d.ts` `PageData` with view models only.
- Keep static SSG constraints: avoid runtime server dependencies; ensure prerender where applicable.
- Preserve Tailwind preset import; only extend in `src/app.css`.
- Keep submodules read-only; no edits under `design-sytem-svelte-components/` or `directus-cms-collections/`.
- Update any alias or server config only if required by moves.
- Document a phased rollout with clear rollback steps.

## B) Target architecture & boundaries (explicit rules)

- **Server-only vs shared**
  - Server-only: `src/routes/**/+page.server.ts`, `src/routes/**/+layout.server.ts`, `src/lib/server/**`, `src/lib/infrastructure/**` (Directus client + Prisma helpers).
  - Shared (client-safe): `src/lib/domain/**`, `src/lib/data/**`, `src/lib/components/**`, `src/lib/core/**`, `src/lib/i18n/**`.
- **Directus client allowed**
  - Only in `src/lib/infrastructure/directus/**` and server load functions under `src/routes/**/+page.server.ts` / `+layout.server.ts`.
- **Validation location**
  - Zod validation occurs at data boundaries inside domain/data functions, or directly after `getItems/getItem` in server load if unavoidable.
- **Component typing**
  - Components receive **view models** or **domain models** defined under `src/lib/domain/**` or `src/lib/data/**`.
  - Components must NOT import `$cms` types or `src/lib/directus/*` schemas.
- **Domain/data/infrastructure responsibilities**
  - `infrastructure`: Directus client, low-level fetch helpers, auth/token handling.
  - `data`: cross-domain orchestrations, page composition.
  - `domain`: per-collection query builders, mapping, and view model types.

## C) Proposed final folder structure (tree)

```
src/
  routes/
    [...path]/
      +page.server.ts
      +page.svelte
      +page.ts
    verify/
      +page.server.ts
      +page.svelte
      README.md
    api/
      qr/
        [publicId].jpg/+server.ts
        [publicId].png/+server.ts
        [publicId].webp/+server.ts
        [publicId].svg/+server.ts
        README.md
      reservations/
        bulk/+server.ts
        README.md
      tokens/
        [reservationId]/+server.ts
    +layout.server.ts
    +layout.svelte
    +error.svelte
    healthcheck/
      +server.ts (or existing)
    utils.ts
  lib/
    components/
      ... (no Directus schemas imported)
    core/
    data/
      page.ts
      pages/
      site-settings.ts
      ...
    domain/
      hotels/
        types.ts
        repository.ts
        mappers.ts
        schemas.ts
      pages/
      sections/
      places/
      restaurants/
      packages/
      tours/
      transportation/
    infrastructure/
      directus/
        client.ts
        schema.d.ts
        utils.ts
        queries/
          ... (new per-collection query builders)
    server/
      ...
```

- Remove/merge: legacy `src/lib/directus/**` into domain/infrastructure modules.
- Migrate `src/lib/[backtoroutes]/**` into `src/routes/**` without URL changes.

## D) Migration map (file-by-file checklist)

- **Legacy Directus client duplication**
  - `src/lib/directus/client.ts` → remove; use `src/lib/infrastructure/directus/client.ts`.
  - `src/lib/directus/utils.ts` → remove; use `src/lib/infrastructure/directus/utils.ts`.
  - Update imports in `src/lib/data/**` and domain repositories to use `$lib/infrastructure/directus/*`.
  - No route behavior change.
- **Legacy Directus schemas in components**
  - Replace component prop types in `src/lib/components/**` that import from `$lib/directus/*` or `$cms/*` with domain view models.
  - Example offenders: `src/lib/components/directus/**`, `src/lib/components/site/**` (see grep results in `src/lib/components`).
  - Update `src/app.d.ts` `PageData` to use domain/view-model types only.
- **Misplaced routes under `$lib`**
  - `src/lib/[backtoroutes]/verify/+page.server.ts `→ `src/routes/verify/+page.server.ts`.
  - `src/lib/[backtoroutes]/verify/+page.svelte `→ `src/routes/verify/+page.svelte`.
  - `src/lib/[backtoroutes]/verify/README.md `→ `src/routes/verify/README.md`.
  - `src/lib/[backtoroutes]/api/qr/**` → `src/routes/api/qr/**` (keep same URL structure).
  - `src/lib/[backtoroutes]/api/reservations/bulk/+server.ts `→ `src/routes/api/reservations/bulk/+server.ts`.
  - `src/lib/[backtoroutes]/api/tokens/[reservationId]/+server.ts` → `src/routes/api/tokens/[reservationId]/+server.ts`.
  - Update imports to new relative paths (likely `../..` to `$lib` aliases).
  - Behavior: URLs remain `/verify` and `/api/**`.
- **Directus query ownership**
  - Move query field arrays and Zod schemas out of `src/lib/directus/**` into `src/lib/domain/**/schemas.ts`.
  - Create `mappers.ts` per domain to map Directus payloads to view models.
  - Update `src/lib/data/page.ts` and `src/routes/[...path]/+page.server.ts` to use mapped types, not raw schemas.
- **Config alignment**
  - If any alias requires update, keep in `vite.config.ts` and `tsconfig.json` only (currently `$lib`, `$cms`, `$ui` already set). No changes unless new alias is introduced.
  - `svelte.config.js` uses `adapter-node` though repo states static SSG; document and decide in plan (no change without explicit instruction).

## E) Redundancy removal list

- `src/lib/directus/client.ts` (duplicate of `src/lib/infrastructure/directus/client.ts`).
- `src/lib/directus/utils.ts` (duplicate of `src/lib/infrastructure/directus/utils.ts`).
- Any direct component usage of `$cms` types (e.g. in `src/lib/components/**`) should be removed after view-model conversion.
- Any unused schemas under `src/lib/directus/**` after migration.
- Confirm safe deletion by searching for remaining imports; only delete when references reach zero.

## F) Strong typing plan (Directus + app)

- **Pattern**

1) Define `QueryItem` fields per collection in domain module.

2) Define Zod schema matching exactly the fields requested.

3) Fetch with `getItems/getItem` from `src/lib/infrastructure/directus/utils.ts`.

4) Validate with schema; treat response as `unknown` until valid.

5) Map to view model (strict, narrow) in domain `mappers.ts`.

6) Return view model types to page loaders and components.

- **Where to store**
  - Query types: `src/lib/domain/<domain>/queries.ts` or `schemas.ts`.
  - Zod schemas: `src/lib/domain/<domain>/schemas.ts`.
  - Mappers: `src/lib/domain/<domain>/mappers.ts`.
  - View models: `src/lib/domain/<domain>/types.ts`.
- **Rules**
  - No `any`; avoid unsafe casts; use `z.infer` and explicit types.
  - No component imports from `$cms` or `src/lib/directus/**`.

## G) Validation strategy (Zod) for STATIC SSG

- Use minimal schemas matching only the `fields` requested in Directus queries.
- Prefer `z.object(...).passthrough()` only when a collection is intentionally opaque and not used in components.
- For lists: validate array of items with `.array()` and fail fast on parsing errors.
- On validation failure, throw a build error with contextual detail in SSG (`error(500)` or `throw new Error` with collection + path info).
- For optional data needed only for non-critical UI, allow fallback to `null` and log with `say()`.

## H) Phased implementation (>=4 phases)

1) **Phase 1 — Route relocation**

   - Objective: move `verify` and `api/**` routes from `$lib` to `src/routes`.
   - Tasks: move files, update imports, ensure URLs unchanged.
   - pnpm commands: `pnpm check`.
   - DoD: routes build, no import errors; URLs unchanged.
   - Rollback: revert file moves.

2) **Phase 2 — Directus infrastructure consolidation**

   - Objective: remove duplicated clients/helpers and standardize on `src/lib/infrastructure/directus`.
   - Tasks: update imports in data/domain modules, remove legacy duplicates after references are zero.
   - pnpm commands: `pnpm check`.
   - DoD: no imports from `src/lib/directus/client.ts` or `utils.ts`.
   - Rollback: restore old imports/files.

3) **Phase 3 — Domain typing + mapping**

   - Objective: define strict query schemas + mappers per domain.
   - Tasks: create per-domain schemas/mappers; update `getPageData` and loaders to use view models.
   - pnpm commands: `pnpm check`.
   - DoD: `+page.server.ts` returns view models only.
   - Rollback: keep old domain functions; revert mapping usage.

4) **Phase 4 — Component boundary enforcement**

   - Objective: remove direct `$cms`/`$lib/directus` usage from components.
   - Tasks: update prop types to view models; adjust component logic accordingly.
   - pnpm commands: `pnpm check`.
   - DoD: grep shows zero `$cms`/`$lib/directus` imports in `src/lib/components`.
   - Rollback: revert component changes.

## I) Verification checklist

- `pnpm check`
- `pnpm lint`
- Manual: render catch-all route (`/[locale]/...`) and verify `entries` output in `src/routes/[...path]/+page.server.ts`.
- Manual: check `/verify?id=...` and `/api/qr/:id.*` endpoints render.
- Confirm `src/lib` has no route files and submodules unchanged.

## J) Blocking questions

- Should we switch back to `adapter-static` in `svelte.config.js` as repo docs suggest, or keep `adapter-node` for current deployment?
- Are `/api/**` routes expected to remain available at runtime in production, or should they be disabled for SSG?
- Which domains are highest priority for strict view models (hotels, restaurants, places, packages, tours, transportation), or should we convert all at once?
- Is it acceptable to change component props to new view-model types even if names differ from Directus fields?
- Any existing Directus preview flow we must preserve when enforcing validation failures in SSG?