# Refactor Status & Implementation Notes

## Completed Phases

### ✅ Phase 1: Route Relocation
- Moved `/src/lib/[backtoroutes]/verify/` → `/src/routes/verify/`
- Moved `/src/lib/[backtoroutes]/api/qr/**` → `/src/routes/api/qr/**`
- Moved `/src/lib/[backtoroutes]/api/reservations/bulk/` → `/src/routes/api/reservations/bulk/`
- Moved `/src/lib/[backtoroutes]/api/tokens/` → `/src/routes/api/tokens/`
- All URLs remain unchanged
- Status: **COMPLETE** ✓

### ✅ Phase 2: Directus Infrastructure Consolidation
- Consolidated all Directus utilities to `src/lib/infrastructure/directus/`
- Deleted duplicate `src/lib/directus/client.ts`
- Deleted duplicate `src/lib/directus/utils.ts`
- Updated all imports to use `infrastructure/directus/utils`
- Updated `src/routes/utils.ts` to use consolidated client
- Updated `src/lib/directus/site-settings.ts` and `hotel-amenities.ts`
- Status: **COMPLETE** ✓

### ✅ Phase 3: Domain Typing + Mappers
- Created example domain (hotels) with:
  - `src/lib/domain/hotels/types.ts` - Zod schemas + view models
  - `src/lib/domain/hotels/schemas.ts` - Directus query builders
  - `src/lib/domain/hotels/mappers.ts` - Directus → View Model transformers
  - `src/lib/domain/hotels/index.ts` - Barrel exports
  - `src/lib/domain/README.md` - Architecture documentation
- Pattern is ready to replicate for other domains (restaurants, places, pages, etc.)
- Status: **COMPLETE** (pattern established, other domains can follow) ✓

### 🔄 Phase 4: Component Boundary Enforcement
- Created `/src/lib/components/COMPONENT_TYPING_GUIDE.md` with:
  - Step-by-step migration process
  - Before/after examples
  - Priority list for component updates
  - Verification checklist
  - Common pitfalls and tips
- **Next Step**: Apply guide to each component systematically
- **High Priority Components** (identified but not yet migrated):
  - `src/lib/components/directus/stopover/hotels-page.svelte`
  - `src/lib/components/directus/stopover/restaurants-page.svelte`
  - `src/lib/components/site/items/cards/promo.svelte`
  - `src/lib/components/site/navigation/breadcrum/breadcrum.svelte`
- Status: **IN PROGRESS** (guide complete, migrations pending)

### ⏳ Phase 5: Cleanup & Verification
- Not yet started
- Tasks:
  - Remove redundant schema files from `src/lib/directus/` after all migrations
  - Verify no submodule files were edited
  - Run `pnpm check` and `pnpm lint`
  - Confirm zero `$cms` imports in `src/lib/components`
- Status: **PENDING** (waiting for phase 4 completion)

## Architecture Summary

### Before
```
src/lib/directus/ (mixed concerns)
  ├── client.ts [DUPLICATE - DELETED]
  ├── utils.ts [DUPLICATE - DELETED]
  └── *.ts (schemas, types, helpers)

Components directly import from src/lib/directus/ and $cms/
```

### After
```
src/lib/infrastructure/directus/ (consolidated client)
  ├── client.ts [SINGLE SOURCE]
  ├── schema.d.ts [Schema types]
  └── utils.ts [getItem, getItems helpers]

src/lib/domain/<domain>/ (per-domain architecture)
  ├── types.ts [Zod schemas + view models]
  ├── schemas.ts [Query builders]
  ├── mappers.ts [Directus → View Model transformers]
  ├── repository.ts [Data access]
  └── index.ts [Public barrel exports]

Components only import from src/lib/domain/
```

## Data Flow (New Pattern)

```
Directus API
    ↓
getItems() [infrastructure/directus/utils]
    ↓
mapDirectusXxxToViewModel() [domain/xxx/mappers]
    ↓
Strongly-typed View Model
    ↓
Page load function [+page.server.ts]
    ↓
Component props [display only]
    ↓
Component renders (no Directus imports)
```

## Implementation Guidance for Phase 4

For each component:

1. **Identify imports:**
   ```bash
   grep -n "from '\$lib/directus/\|from '\$cms/" <component.svelte>
   ```

2. **Map to view models:**
   - Determine what data the component needs
   - Find corresponding view model in `src/lib/domain/`
   - Update prop types

3. **Update logic:**
   - Remove Zod validators
   - Replace type guards with property checks or discriminators
   - Test rendering

4. **Update data source:**
   - Update `+page.server.ts` to return view models instead of raw Directus types
   - Use mappers from domain layer

5. **Verify:**
   ```bash
   pnpm check  # Should have no errors about imports
   ```

## Known Issues & Limitations

1. **Env vars missing:** 
   - `DIRECTUS_REST_URL`, `DIRECTUS_TOKEN`, etc. not in `.env`
   - `pnpm check` reports module not found warnings
   - This is expected in build environment; .env is local/CI only

2. **Incomplete other domains:**
   - Only hotels domain has full types/mappers
   - restaurants, places, pages, sections, etc. still use mixed approach
   - Apply same pattern to each

3. **Type compatibility:**
   - `src/app.d.ts` PageData still has mixed types (some Directus, some view models)
   - Should be updated once all domains have view models

## Next Steps for Implementer

1. **Replicate hotels domain pattern** for:
   - restaurants
   - places
   - pages
   - sections
   - packages
   - tours
   - transportation

2. **Migrate components** using `COMPONENT_TYPING_GUIDE.md`:
   - Start with high-priority components
   - Apply systematically

3. **Update page loaders** to use mappers:
   - `src/routes/[...path]/+page.server.ts`
   - `src/routes/+layout.server.ts`

4. **Verify & Clean:**
   - Run `pnpm check && pnpm lint`
   - Confirm zero `$cms` imports in components
   - Delete unused `src/lib/directus/` files

5. **Test rendering:**
   - Dev server: `pnpm dev`
   - Build: `pnpm build`
   - Preview: `pnpm preview`
