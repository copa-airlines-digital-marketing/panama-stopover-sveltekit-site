# Component Typing Migration Guide

## Goal

Remove all `$cms/*` imports and raw `$lib/directus/*` type imports from components.
Components should only receive strongly-typed view models from loaders.

## Current State (❌ DO NOT DO THIS)

```svelte
<!-- ❌ BAD: Importing Directus schemas directly -->
<script>
  import type { HotelSchema } from '$lib/directus/hotels';
  import type { StopoverTour } from '$cms/collections/stopover_tours/stopover_tours';
  
  export let item: HotelSchema | StopoverTour;
</script>
```

## Target State (✅ DO THIS)

```svelte
<!-- ✅ GOOD: Importing view model from domain -->
<script>
  import type { HotelCardViewModel } from '$lib/domain/hotels';
  
  export let item: HotelCardViewModel;
</script>
```

## Step-by-Step Process

### 1. Identify Current Component Props

Find all `$lib/directus/*` and `$cms/*` imports in a component.

Example: `src/lib/components/site/items/cards/promo.svelte`

```typescript
import { isHotelSchema, type HotelSchema } from '$lib/directus/hotels';
import { isRestaurantSchema, type RestaurantSchema } from '$lib/directus/restaurants';
import { isPlaceSchema, type PlaceSchema } from '$lib/directus/place-to-visit';
```

### 2. Define View Model Props

Create a union of view models (NOT raw Directus types):

```typescript
import type { HotelCardViewModel } from '$lib/domain/hotels';
import type { RestaurantCardViewModel } from '$lib/domain/restaurants';
import type { PlaceCardViewModel } from '$lib/domain/places';

type ItemViewModel = HotelCardViewModel | RestaurantCardViewModel | PlaceCardViewModel;

export let item: ItemViewModel;
```

### 3. Refactor Component Logic

Replace Directus type guards with view model discriminators:

**Before:**
```typescript
const category = isPlaceSchema(item) ? item.pilar : !!item.pilar ? item?.pilar[0] : null;
const theme = isHotelSchema(item)
  ? 'theme-hotel'
  : isRestaurantSchema(item)
  ? 'theme-restaurant'
  : 'theme-place';
```

**After:**
```typescript
// If view models have explicit type discriminators:
function getTheme(item: ItemViewModel): string {
  if ('bookingEmail' in item) return 'theme-hotel'; // hotels have this
  if ('cuisine' in item) return 'theme-restaurant';  // restaurants have this
  if ('activities' in item) return 'theme-place';    // places have this
  return 'theme-default';
}

const theme = getTheme(item);
```

OR add explicit type discriminator to view models:

```typescript
type HotelCardViewModel = {
  kind: 'hotel';
  mainImage: string;
  name: string;
  // ...
};

type RestaurantCardViewModel = {
  kind: 'restaurant';
  name: string;
  cuisine: string;
  // ...
};

// In component:
const theme = item.kind === 'hotel' ? 'theme-hotel' : item.kind === 'restaurant' ? 'theme-restaurant' : 'theme-place';
```

### 4. Update Data Sources

Ensure loaders return view models:

**Page load function:**
```typescript
export async function load(event) {
  // OLD (❌):
  const hotelData = await getHotel(...);
  return { stopover_hotels: hotelData }; // Raw Directus type

  // NEW (✅):
  const hotelRaw = await getHotel(...);
  const hotelVM = mapHotelToCardViewModel(hotelRaw, locale);
  return { stopover_hotels: hotelVM }; // View model type
}
```

### 5. Type Component Props in Page

Update `src/routes/[...path]/+page.svelte` to pass view models:

```svelte
<script>
  import PromoCard from '$lib/components/site/items/cards/promo.svelte';
  
  export let data; // data is PageData with view models only
</script>

<PromoCard item={data.stopover_hotels} />
```

## Priority Components to Migrate

1. **Highest Priority (Used in critical paths):**
   - `src/lib/components/directus/stopover/hotels-page.svelte`
   - `src/lib/components/directus/stopover/restaurants-page.svelte`
   - `src/lib/components/site/items/cards/promo.svelte`
   - `src/lib/components/site/navigation/breadcrum/breadcrum.svelte`

2. **Medium Priority:**
   - Text content components
   - Navigation components
   - Section processors

3. **Low Priority:**
   - Utility/helper components (rarely change)

## Verification

### Before Migration
```bash
cd src/lib/components
grep -r "from '\$lib/directus/" . | wc -l
grep -r "from '\$cms/" . | wc -l
```

### After Migration (should be 0)
```bash
cd src/lib/components
grep -r "from '\$lib/directus/" . | wc -l   # ← must be 0
grep -r "from '\$cms/" . | wc -l            # ← must be 0
```

## Tips

- **Use TypeScript `satisfies` for type checking** without explicit casts:
  ```typescript
  const items = [hotel1, hotel2] satisfies HotelCardViewModel[];
  ```

- **Create helper type discriminators** if union is complex:
  ```typescript
  function isHotel(item: ItemViewModel): item is HotelCardViewModel {
    return 'bookingEmail' in item;
  }
  ```

- **Document prop shape** in component comments if not obvious:
  ```svelte
  <!-- @component
    Renders a promo card for hotels, restaurants, or places.
    Expects a view model (not raw Directus type).
  -->
  ```

## Common Pitfalls

❌ **DON'T** import guards/validators:
```typescript
import { isHotelSchema, hotelSchema } from '$lib/directus/hotels';
```

✅ **DO** import view models:
```typescript
import type { HotelCardViewModel } from '$lib/domain/hotels';
```

❌ **DON'T** validate in component:
```typescript
if (hotelSchema.safeParse(item).success) { /* ... */ }
```

✅ **DO** trust incoming types (validation happens at boundary):
```typescript
// Component just uses the type
const email = item.bookingEmail; // ← safe because type guarantees it
```
