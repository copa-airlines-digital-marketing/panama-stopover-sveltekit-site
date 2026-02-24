# Domain Layer Architecture

## Overview

The domain layer (`src/lib/domain/`) implements Domain-Driven Design (DDD) principles:
- Each domain (hotels, restaurants, pages, etc.) is self-contained
- Interfaces between domain and external systems (Directus) are explicit
- View models (mappers) transform Directus responses into app-owned types

## Domain Structure

Each domain directory has:

```
domain/<domain>/
  ├── types.ts       # Zod schemas + view model types
  ├── schemas.ts     # Directus query builders (field specs, filters)
  ├── mappers.ts     # Transform Directus → view models
  ├── repository.ts  # Data access (fetch + validate)
  └── index.ts       # Public exports (barrel file)
```

## Pattern: Query → Validate → Map → Return

```typescript
// 1. Query builder (schemas.ts)
export function buildHotelQuery(locale: string) {
  return {
    fields: ['main_image', 'name', /* ... */],
    filter: { /* ... */ },
    deep: { /* ... */ }
  };
}

// 2. Fetch (repository.ts)
const rawData = await getItems('stopover_hotels', buildHotelQuery(locale), preview);

// 3. Validate + Map (mappers.ts)
const hotelVM = mapDirectusHotelToViewModel(rawData, locale);

// 4. Return to page/component
return hotelVM; // ← Strongly typed, never raw Directus
```

## Rules

1. **Components never import domain types directly from `$lib/directus`**
   - Only via `$lib/domain/<domain>` exports
   - Only view models (narrow, app-owned types)

2. **Server-only boundary validation**
   - Zod validation happens in repository or mappers
   - If invalid, fail fast: throw error or return null

3. **View models are app-owned**
   - Different structure/naming than Directus if needed
   - No leakage of Directus internals (collection names, field suffixes)

4. **Query builders are explicit**
   - Every field in query is intentional
   - Comments explain why each field is needed

## Example: Hotels Domain

- `types.ts`: Defines `HotelSchema`, `HotelTranslation`, `Location`, etc.
- `schemas.ts`: `buildHotelQuery()`, `buildHotelListQuery()`
- `mappers.ts`: `mapHotelToDetailViewModel()`, `mapHotelToCardViewModel()`
- `repository.ts`: `getHotel()`, `getHotels()` (fetch + validate + map)
- `index.ts`: Public barrel export

## Implementing a New Domain

1. Copy the hotels domain structure
2. Adjust types to match Directus collection fields
3. Update query builders for that collection
4. Create mappers for use-cases (list, detail, card, etc.)
5. Implement repository (fetch + map)
6. Update barrel export

## Directus Schema Reference

Directus collection definitions live in the submodule `$cms`:
```typescript
import type { StopoverHotel } from '$cms/collections/stopover_hotels';
```

These are **read-only references** only.  
**App owns the narrowed query types** based on fields actually used.

