# Mixed Experience Module — Activities & Tours Merge

> Commit: `03885f5` — `feat: merge tour and activities part 1 ready to review`

## Overview

The **Mixed Experience Module** (`stopover_mixed_experience_module`) is a new Directus-backed content block that replaces the need for separate activity and tour modules. It allows CMS editors to curate a single card grid sourced from **any combination** of entity types: activities, tours, hotels, restaurants, packages, and transportation.

The module renders using the `PromoShow` card component, with an optional entity-type badge ("Tour" / "Activity" / "Actividad" / etc.) that is inferred automatically from the source collection.

---

## What Changed

### New files

| File | Purpose |
|------|---------|
| `src/lib/directus/stopover_mixed_experience_module.ts` | Zod schema + type exports for the new module |
| `src/lib/components/directus/general-components/mixed-experience-module/mixed-experience-module.svelte` | Svelte component that renders the card grid |
| `src/lib/components/directus/general-components/mixed-experience-module/index.ts` | Barrel export |

### Modified files

| File | What changed |
|------|-------------|
| `src/routes/[...path]/+page.server.ts` | Added mixed-module detection + multi-collection item fetching |
| `src/routes/utils.ts` | Extended collection aliases, added shared sort logic, added mixed module support |
| `src/lib/directus/section.ts` | Added mixed module to section content schema |
| `src/lib/directus/content-group.ts` | Added mixed module to content group schema |
| `src/lib/directus/stopover_hotel_module.ts` | Minor cleanup |
| `src/lib/components/directus/utils.ts` | Shared utility additions |
| `src/lib/components/site/navigation/home/navigation-home.svelte` | UI fix for home navigation |

---

## Directus Schema

The CMS collection is `stopover_mixed_experience_module` (also tolerates the legacy typo variant `stopover_mixed_experiece_module`).

```
stopover_mixed_experience_module
├── key                   string (required)
├── max_items             number
├── prefilter             string | null  →  "promotions" to show only discounted items
├── sources[]
│   ├── entity_type       string  →  e.g. "activities", "tours", "hotels"
│   └── item              number | string | object | null
└── translations[]
    ├── languages_code
    ├── title
    ├── description
    ├── disclaimer_text
    ├── primary_cta_label
    ├── primary_cta_url
    ├── secondary_cta_label
    └── secondary_cta_url
```

### `entity_type` accepted values

The following values (and their aliases) are all resolved to the correct Directus collection:

| `entity_type` value | Resolves to |
|---------------------|-------------|
| `activities`, `activity`, `stopover_place_to_visit`, `stopover_activity` | `stopover_place_to_visit` |
| `tours`, `tour`, `stopover_tour`, `stopover_tours` | `stopover_tour` |
| `hotels`, `hotel`, `stopover_hotel`, `stopover_hotels` | `stopover_hotels` |
| `restaurants`, `restaurant`, `stopover_restaurant`, `stopover_restaurants` | `stopover_restaurants` |
| `packages`, `package`, `stopover_package`, `stopover_packages` | `stopover_package` |
| `transportation`, `transport`, `stopover_transportation`, `stopover_transport` | `stopover_transportation` |

---

## Data Flow

```
+page.server.ts
  └── getModulesConfigList(sections)
        ↓ Finds all stopover_mixed_experience_module entries in sections/content-groups
  └── For each mixed module:
        └── Reads sources[].entity_type
        └── Queries each collection via buildMixedPromoItemsQuery()
              ↓ Fields: priority, main_image, promo_discount_*, translations, parent_page
        └── Merges items from all sources
        └── Sorts merged list via comparePromoItems()
        └── Trims to max_items
  └── Passes result to $page.data.mixed_items_query_output

mixed-experience-module.svelte
  └── Reads $page.data.mixed_items_query_output.sorted_items
  └── Renders PromoShow card per item
  └── Infers entity-type badge from promo._collection
  └── Renders primary / secondary CTAs from module translations
```

---

## Sorting Logic

Items from all sources are merged and sorted by the following criteria (in order):

1. **Priority** — higher number wins (`priority DESC`)
2. **Promo discount percent** — higher discount wins (`promo_discount_percent DESC`)
3. **Date created** — older items ranked first (`date_created ASC`) — "antiguedad"
4. **Name** — alphabetical fallback (`name ASC`, locale-aware)

```ts
// src/routes/utils.ts
const comparePromoItems = (a, b) => {
  byPriority → byDiscountPercent → byDate → byName
};
```

---

## Prefilter: Promotions Mode

When `prefilter` is set to `"promotions"` (case-insensitive), the module only fetches items that have at least one of:

- `promo_discount_amount` set
- `promo_discount_percent` set
- `promo_code` set

---

## Entity Type Badge

The `getEntityTypeLabel()` function in the Svelte component maps a collection name to a localised label shown on the card:

| Locale | Tour label | Activity label |
|--------|-----------|----------------|
| `en` | Tour | Activity |
| `es` | Tour | Actividad |
| `pt` | Tour | Atividade |

The badge only appears when the item also has a promo discount displayed.

---

## CMS Setup Checklist

When creating a new `stopover_mixed_experience_module` in Directus:

- [ ] Add the module to a **section** (`section_content`) or to a **content group** (`content_group.content`)
- [ ] Configure at least one entry in `sources[]` with the correct `entity_type`
- [ ] Set `max_items` (recommended: 4–8)
- [ ] Set `prefilter` to `"promotions"` if the block should only show discounted items
- [ ] Add translations for each language (at minimum title + one CTA pair)
- [ ] Verify that the referenced entities have `parent_page` set (required for card links to work)

---

## Known Limitations / Next Steps

- **Part 1 only**: The current implementation fetches items but does not yet support inline item pinning from the CMS (`sources[].item` is typed but not consumed).
- The legacy typo variant `stopover_mixed_experiece_module` is supported as a fallback — this alias should be removed once the CMS collection is fully migrated.
- Sort by discount amount (`promo_discount_amount`) is not yet part of the primary sort key; only `promo_discount_percent` is considered.
