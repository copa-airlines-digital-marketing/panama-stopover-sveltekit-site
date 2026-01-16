# Project Overview

This repository is a **static SvelteKit site** (Svelte 4) built/deployed on **Cloudflare Pages**.
- Package manager: **pnpm**
- Styling: **Tailwind CSS v4** using **presets imported from Git submodules**
- Content/data: **Directus** (configuration/settings live in a **separate submodule**)

## Non-negotiable constraints

### Git submodules are read-only
- **DO NOT modify files inside submodule directories.**
- If changes are required in a submodule, propose changes in the submodule's own repo.
- In this repo, it is allowed to **update the submodule reference (gitlink SHA)** only.

### Type safety is strict
- Prefer **TypeScript-first** solutions; keep types explicit and narrow.
- Avoid `any` and unsafe casts (`as unknown as`).
- Prefer `satisfies`, discriminated unions, and typed helpers.
- When consuming Directus data, validate/parse at boundaries (runtime + TS types).

### Cloudflare + static output
- No server-only runtime assumptions.
- Prefer prerenderable routes; document if any route cannot be prerendered.

## Working style for changes
- Make minimal diffs; preserve existing architecture.
- If you must change a config (Tailwind/SvelteKit/Cloudflare), explain the rationale and blast radius.
- Never hand-edit lockfiles; use pnpm commands instead.

## Submodules are read-only

This repo includes git submodules:
- design-sytem-svelte-components/
- directus-cms-collections/
(and a nested submodule: design-sytem-svelte-components/tailwind-presets/)

### Hard rule
- DO NOT edit any files under those submodule directories.
- The only allowed change related to submodules in this repo is updating the recorded gitlink SHA (submodule reference) and, if needed, .gitmodules.

### If a change is needed in a submodule
- Provide a plan: implement in the submodule's own repository → bump the submodule pointer here.
- In this repo, prefer adapter/wrapper code outside the submodule to integrate changes.

## Domain-Driven Design (DDD) Architecture

### Established Pattern
All domain logic follows this structure:
```
src/lib/domain/{domain}/
├── types.ts       # Zod schemas + TypeScript types
├── schemas.ts     # Directus query builders
├── mappers.ts     # Raw → ViewModel transformations
├── repository.ts  # Data fetching (optional)
└── index.ts       # Public API exports
```

### Implemented Domains (DO NOT modify structure)
- Hotels
- Restaurants
- Places
- Pages
- Packages
- Tours
- Transportation

### When working with domains
- Use existing query builders from `schemas.ts`
- Use ViewModels from `mappers.ts` in components
- Never import Directus types directly in components
- Apply mappers at boundaries (loaders, not components)

## Type Casting for Directus SDK

Due to Directus SDK type limitations, we use `as any` in specific places:
- Query fields: `fields: [...] as any`
- Query filters: `filter: { ... } as any`
- Deep queries: `deep: { ... } as any`

**This is intentional and required.** Do not try to fix these.

## Environment Variables

Required in `.env`:
- DIRECTUS_REST_URL
- DIRECTUS_TOKEN
- DIRECTUS_PREVIEW_TOKEN
- PREVIEW_SECRET
- SITE_ID
- BASE_URL
- CATEGORIES_MAP
- IP_HASH_SALT
- DATABASE_URL
- PUBLIC_SUPPORTED_LANGUAGES

See `ENV_SETUP_GUIDE.md` for details.

## File Organization

### Do NOT create files in:
- `src/lib/[backtoroutes]/` - Deprecated, use `src/routes/`
- Root of `src/lib/directus/` for new code - Use `src/lib/domain/` instead

### Prefer:
- Domain modules: `src/lib/domain/{domain}/`
- Infrastructure: `src/lib/infrastructure/directus/`
- Routes: `src/routes/`
- Components: `src/lib/components/`
- Core utilities: `src/lib/core/`

## Error Handling

### Pre-existing errors to ignore:
- Submodule errors in `design-sytem-svelte-components/` (7 errors in typography)
- Environment variable errors if `.env` not configured
- Pre-existing type errors in legacy `src/lib/data/pages/` files

### Do NOT fix:
- Type errors in submodules (read-only)
- Directus SDK query type issues (require `as any`)

## Documentation

When making significant changes:
- Update relevant documentation in root `.md` files
- Follow established patterns in existing domains
- Add comments for complex logic
- Update `REFACTOR_FINAL_STATUS.md` if needed

## Testing

Before suggesting changes:
- Ensure TypeScript compiles: `pnpm tsc --noEmit`
- Check for new errors, not pre-existing ones
- Suggest testing with: `pnpm build` and `pnpm preview`

## Code Style

- Use tabs for indentation (project standard)
- Prefer `const` over `let`
- Use template literals for strings with variables
- Use optional chaining `?.` and nullish coalescing `??`
- Prefer arrow functions
- Use TypeScript strict mode conventions

## Directus Integration

### Query builders
Always use domain query builders:
```typescript
import { buildHotelQuery } from '$lib/domain/hotels';
const query = buildHotelQuery(locale);
```

### Mappers
Always apply mappers to raw Directus data:
```typescript
import { mapDirectusHotelToViewModel } from '$lib/domain/hotels';
const viewModel = mapDirectusHotelToViewModel(rawData, locale);
```

### ViewModels in Components
```typescript
import type { HotelCardViewModel } from '$lib/domain/hotels';
export let hotel: HotelCardViewModel;
```

## Zod Validation

All domain types are validated with Zod:
- Use `.safeParse()` for validation
- Handle validation errors gracefully
- Log warnings for invalid data
- Return `null` or fallback for invalid data

## Path Aliases

Configured in `tsconfig.json`:
- `$lib/*` → `src/lib/*`
- `$cms/*` → `directus-cms-collections/src/*`
- `$ui/*` → `design-sytem-svelte-components/src/*`

## Prohibited Actions

1. **NEVER** modify files in submodule directories
2. **NEVER** use `any` except for Directus SDK workarounds
3. **NEVER** import raw Directus types in components
4. **NEVER** edit lockfiles manually
5. **NEVER** create files in deprecated directories
6. **NEVER** commit `.env` with real values
7. **NEVER** skip Git hooks
8. **NEVER** force push to main/master

## Preferred Actions

1. **ALWAYS** use domain ViewModels in components
2. **ALWAYS** validate with Zod at boundaries
3. **ALWAYS** use query builders from domains
4. **ALWAYS** apply mappers in loaders, not components
5. **ALWAYS** follow DDD pattern for new domains
6. **ALWAYS** check TypeScript errors after changes
7. **ALWAYS** preserve existing architecture

## When Adding New Features

1. Check if domain exists in `src/lib/domain/`
2. If yes, extend existing domain
3. If no, create new domain following established pattern
4. Create ViewModels for components
5. Create query builders for data fetching
6. Create mappers for data transformation
7. Export everything from `index.ts`
8. Update `app.d.ts` if adding to PageData
9. Document in domain's README if complex

## References

- DDD Pattern: `src/lib/domain/README.md`
- Component Migration: `COMPONENT_TYPING_GUIDE.md`
- Environment Setup: `ENV_SETUP_GUIDE.md`
- Project Status: `REFACTOR_FINAL_STATUS.md`
- Next Steps: `NEXT_STEPS.md`
