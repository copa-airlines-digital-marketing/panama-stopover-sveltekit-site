---
title: "Implementation Spec v2 — Join: Filters, Sorting & Translations"
type: synthesis
tags: [spec, directus, svelte, filters, sorting, translations, implementation]
created: 2026-04-17
updated: 2026-04-17
sources: [chatgpt-modeling, filters-and-sorting-spec]
confidence: high
---

# Implementation Spec v2 — Join: Filters, Sorting & Translations

> **Para Cursor:** Este documento especifica todos los cambios de Directus y frontend necesarios.
> El Join ya está publicado en panama-stopover.com. Esta es la segunda iteración.
> Implementa en el orden indicado; cada sección es independiente salvo que se indique lo contrario.

---

## Estado actual

### Directus — completado (2026-04-17)

**Colecciones**
- ✅ `stopover_mixed_experience_module` con: `key`, `max_items`, `prefilter`, `sort`, `sources` (O2M), `translations` (O2M), y los 5 booleans `filter_*_enabled` (default true, not null)
- ✅ `stopover_mixed_experience_module_translations` con los 10 campos originales + los 7 nuevos (`reference_point_label`, `filter_language_label`, `filter_category_label`, `filter_discount_label`, `filter_duration_label`, `filter_distance_label`, `filter_apply_label`) — todos nullable, interface `input`
- ✅ `stopover_mixed_experience_module_sources` con: `id`, `entity_type`, `max_items`, `module_id`, `status`, `translations` (O2M, nueva)
- ✅ `stopover_mixed_experience_module_sources_translations` creada con: `id` (PK), `stopover_mixed_experience_module_sources_id` (FK → sources.id CASCADE), `languages_code` (FK → languages.code), `label` (string 40, nullable)

**Seed data**
- ✅ 6 rows en `sources_translations`: 2 sources × 3 idiomas (`en`/`es`/`pt`)
  - source 1 (`stopover_place_to_visit`): Activity / Actividad / Atividade
  - source 2 (`stopover_tours`): Tour / Tour / Tour

**Campos ya existentes en tours / places (validados)**
- `meeting_point: GeoJSON` en `stopover_tour`
- `location: GeoJSON` en `stopover_place_to_visit`
- `experience_category: number` (M2O) en ambos
- `duration` — ⚠️ `number` en tours, `string` en places → normalizar a `number`
- `supported_languages: Record<string, unknown>` (jsonb) en ambos
- `priority`, `promo_discount_percent`, `promo_discount_amount`, `date_created` en ambos

### Contenido existente en el CMS

Único módulo publicado: `activities-and-tour-merge` (`max_items: 6`, `prefilter: promotions`).

- Sources: `stopover_place_to_visit` (id=1, max_items=3) + `stopover_tours` (id=2, max_items=3)
- Translations pobladas sólo en `title`, `primary_cta_label`, `secondary_cta_label` para `en`/`es`/`pt`
- `description`, `disclaimer_text`, `primary_cta_url`, `secondary_cta_url` están vacíos
- Nuevos `reference_point_label`, `filter_*_label`, `filter_apply_label` están vacíos → cargar desde CMS

### Pendiente en Directus (contenido editorial)
- [ ] Cargar valores para `reference_point_label`, `filter_language_label`, `filter_category_label`, `filter_discount_label`, `filter_duration_label`, `filter_distance_label`, `filter_apply_label` en los 3 idiomas desde el Directus Studio

### Pendiente en Frontend
- [ ] Actualizar Zod schema local `src/lib/directus/stopover_mixed_experience_module.ts`
- [ ] Registrar `stopover_mixed_experience_module_sources_translations` en `src/lib/infrastructure/directus/schema.d.ts`
- [ ] PARTES 4 a 8 del spec (query, helpers, normalización, filtros, sort)

---

## Contexto

El módulo `stopover_mixed_experience_module` renderiza una lista unificada de items de
`stopover_tours` y `stopover_place_to_visit`. La unificación es UX-only: las colecciones
permanecen separadas en Directus; el merge ocurre en el frontend Svelte.

Campos comunes entre ambas colecciones (confirmados en generated types del submodule):
- `supported_languages` (jsonb / `Record<string, unknown>`) — multi-select serializado
- `promo_discount_percent` (number)
- `experience_category` (`number` / M2O — single select, NO multi como asumía el spec original)
- `duration` — **⚠️ `number` en tours, `string` en places** → requiere normalización a `number`
- `meeting_point` en tours / `location` en places (ambos `GeoJSON`)

---

## Permisos necesarios para implementar

Siguiendo la convención documentada en `docs/cms.md` §5 (dev / preview / prod).

### En Directus (rol admin o equivalente con schema edit)

Necesarios **antes** de empezar con el frontend:

- [ ] **Schema edit** en el proyecto Directus de dev para:
  - Agregar 5 campos `boolean` a `stopover_mixed_experience_module` (PARTE 2)
  - Agregar 7 campos `string` a `stopover_mixed_experience_module_translations` (PARTE 1.1)
  - Crear la colección `stopover_mixed_experience_module_sources_translations` con sus relaciones (PARTE 1.2)
- [ ] **Permisos de lectura (`read`)** para el rol **API público / anónimo** usado por el build:
  - `stopover_mixed_experience_module_sources_translations.*` (colección nueva)
  - Nuevos campos en `stopover_mixed_experience_module` y `_translations` (Directus requiere habilitar cada campo explícitamente cuando se usa field-level permissions)
- [ ] **Permisos de escritura (`create` / `update`)** para el rol de editores de CMS en las tres colecciones, replicando el patrón existente del módulo
- [ ] Aplicar la misma configuración de permisos en **dev, preview y prod** (ver `docs/cms.md` §5):
  - dev: lectura de todo el contenido, incluye drafts
  - preview: idéntico a dev pero emulando el comportamiento de preview-mode
  - prod: sólo contenido con `status = published`

### Sobre el token de API

El Static Token que usa el cliente de Directus (`DIRECTUS_TOKEN` vía Doppler) debe tener acceso a:

- La colección nueva `stopover_mixed_experience_module_sources_translations`
- Los campos nuevos en las dos colecciones existentes

Si el token hereda permisos del rol público, basta con cumplir el checklist anterior. Si usa un rol dedicado, agregar los mismos permisos ahí.

### En el repo `directus-cms-collections`

Después de aplicar los cambios de schema en Directus (dev):

- [ ] Acceso de escritura al repo del submodule para **regenerar tipos** con el generador (`pnpm generate` o equivalente dentro del submodule)
- [ ] Acceso de commit/push en la rama `main` del submodule
- [ ] Una vez mergeado, actualizar la referencia del submodule en este repo con `git submodule update --remote`

### En el repo principal (sveltekit-site)

- [ ] Acceso de escritura para modificar los siguientes archivos:
  - `src/lib/directus/stopover_mixed_experience_module.ts` (Zod schema)
  - `src/lib/directus/section.ts` y `src/lib/directus/content-group.ts` (si cambia la forma del item)
  - `src/lib/infrastructure/directus/schema.d.ts` (agregar la nueva colección al `Schema`)
  - `src/routes/[...path]/+page.server.ts`
  - `src/routes/utils.ts`
  - `src/lib/components/directus/general-components/mixed-experience-module/mixed-experience-module.svelte`
- [ ] Permiso de PR en `dev` del repo principal

### Flujo ordenado (dependencias entre permisos)

1. Admin Directus aplica schema y permisos en **dev** → regenerar tipos en submodule → PR en submodule
2. Submodule mergeado → bump del puntero en el repo principal → PR de frontend
3. QA en dev+preview → replicar cambios de schema/permisos en **prod**
4. Merge a `main` y deploy

### Datos / Contenido

- [ ] Acceso de editor al CMS de dev para:
  - Cargar los 4 registros iniciales de `sources_translations` (PARTE 3.1)
  - Verificar que todos los módulos existentes queden con los 5 booleans en `true` después de la migración (PARTE 2)
  - Añadir traducciones de filtros (`filter_*_label`, `filter_apply_label`, `reference_point_label`) al menos en `es-PA` y `en-US`

---

## PARTE 1 — Directus: nuevas colecciones de traducciones

### 1.1 `stopover_mixed_experience_module_translations`

La colección **ya existe**. Solo agregar los campos faltantes:

```
Campos YA EXISTENTES (no tocar):
  ✅ languages_code, title, description, disclaimer_text
  ✅ primary_cta_label, primary_cta_url, primary_cta
  ✅ secondary_cta_label, secondary_cta_url, secondary_cta
  ✅ stopover_mixed_experience_module_key (relación al módulo padre)

Campos A AGREGAR (todos nullable):
  reference_point_label  string   max 80   — texto del punto de referencia geográfico
                                             ej. "Medido desde Iglesia del Carmen, Vía España"
  filter_language_label  string   max 40   — label del filtro de idioma en UI
  filter_category_label  string   max 40
  filter_discount_label  string   max 40
  filter_duration_label  string   max 40
  filter_distance_label  string   max 40
  filter_apply_label     string   max 30   — label del botón "Aplicar filtros"
                                             ej. es-PA: "Aplicar" | en-US: "Apply"
```

### 1.2 `stopover_mixed_experience_module_sources_translations`

❌ **No existe todavía.** Crear esta colección:

```
Relaciones:
  source_id      M2O → stopover_mixed_experience_module_sources
                 (field en padre: "translations", interface: translations)
  languages_code M2O → languages

Campos:
  label   string   max 40   nullable
          — nombre visible del tipo de entidad
            ej. es-PA: "Tour" / "Actividad" | en-US: "Tour" / "Activity"
```

> **Nota sobre `sources`:** la colección `stopover_mixed_experience_module_sources`
> ya existe con los campos `id`, `entity_type`, `max_items`, `module_id`, `status`.
> `max_items` a nivel de source ya está listo para usarse como cap individual.

---

## PARTE 2 — Directus: nuevos campos en `stopover_mixed_experience_module`

Agregar 5 campos booleanos. **Default: true** (todos los filtros activos al crear un módulo nuevo).

```
filter_language_enabled   boolean   default true
filter_category_enabled   boolean   default true
filter_discount_enabled   boolean   default true
filter_duration_enabled   boolean   default true
filter_distance_enabled   boolean   default true
```

**Importante:** No crear `category_filter_mode` — no existe y no debe crearse. Los 5 booleans son su reemplazo unificado.

---

## PARTE 3 — Directus: migración de datos iniciales

Una vez creadas las colecciones de traducciones, cargar los valores actuales hardcodeados.

### 3.1 `sources_translations` — entity type labels

Los idiomas reales del CMS son códigos ISO cortos: `en`, `es`, `pt` (NO `en-US`/`es-PA`).
El `entity_type` actual del módulo `activities-and-tour-merge` es `stopover_place_to_visit`
y `stopover_tours` (plural). Seed ya cargado:

| `source.id` | `entity_type` | `languages_code` | `label` |
|---|---|---|---|
| 1 | `stopover_place_to_visit` | `en` | Activity |
| 1 | `stopover_place_to_visit` | `es` | Actividad |
| 1 | `stopover_place_to_visit` | `pt` | Atividade |
| 2 | `stopover_tours` | `en` | Tour |
| 2 | `stopover_tours` | `es` | Tour |
| 2 | `stopover_tours` | `pt` | Tour |

> Nota: si se desea usar "Passeio" en portugués (congruente con el title del módulo
> "Atividades e Passeios"), editar el valor desde Directus Studio. Los seeds iniciales
> preservaron los strings actualmente hardcodeados en `mixed-experience-module.svelte`
> (líneas 88–92) para minimizar cambios visuales.

### 3.2 `module_translations` — contenido existente

Si el módulo ya tiene contenido (title, description, CTAs) cargado directamente en campos
de la tabla principal, migrar esos valores a la colección de traducciones con el idioma
correspondiente antes de borrar los campos originales.

---

## PARTE 4 — Frontend: query de Directus

Actualizar el query del módulo para incluir traducciones:

```
GET /items/stopover_mixed_experience_module/{id}
  ?fields=
    id,
    max_items,
    prefilter,
    primary_cta_url,
    secondary_cta_url,
    filter_language_enabled,
    filter_category_enabled,
    filter_discount_enabled,
    filter_duration_enabled,
    filter_distance_enabled,
    translations.languages_code,
    translations.title,
    translations.description,
    translations.disclaimer_text,
    translations.primary_cta_label,
    translations.secondary_cta_label,
    translations.reference_point_label,
    translations.filter_language_label,
    translations.filter_category_label,
    translations.filter_discount_label,
    translations.filter_duration_label,
    translations.filter_distance_label,
    sources.id,
    sources.entity_type,
    sources.max_items,
    sources.status,
    sources.translations.languages_code,
    sources.translations.label
```

---

## PARTE 5 — Frontend: helper de idioma

Si no existe ya, agregar:

```typescript
function pickTranslation<T extends { languages_code: string }>(
  translations: T[],
  lang: string,
  fallback = 'es-PA'
): T | undefined {
  return (
    translations.find(t => t.languages_code === lang) ??
    translations.find(t => t.languages_code === fallback) ??
    translations[0]
  );
}
```

---

## PARTE 6 — Frontend: normalización del card model

### 6.1 Campo `geoPoint`

Al normalizar cada ítem del pool unificado:

```typescript
// Tours:
geoPoint: item.meeting_point ?? null,

// Activities:
geoPoint: item.location ?? null,
```

**Confirmado** en `directus-cms-collections`: ambos campos son de tipo `GeoJSON`
(formato `{ type: "Point", coordinates: [lng, lat] }`). La función `haversineKm`
debe acceder como:

```typescript
const lng = geoPoint.coordinates[0];
const lat = geoPoint.coordinates[1];
```

### 6.2 Campo `distanceFromCenter`

Calcular durante la normalización usando haversine.
Punto de referencia fijo: **Iglesia del Carmen, Vía España** — `{ lat: 8.9936, lng: -79.5197 }`.

```typescript
const IGLESIA_DEL_CARMEN = { lat: 8.9936, lng: -79.5197 };

function haversineKm(
  a: { lat: number; lng: number },
  b: { lat: number; lng: number }
): number {
  const R = 6371;
  const dLat = ((b.lat - a.lat) * Math.PI) / 180;
  const dLng = ((b.lng - a.lng) * Math.PI) / 180;
  const sinLat = Math.sin(dLat / 2);
  const sinLng = Math.sin(dLng / 2);
  const x =
    sinLat * sinLat +
    Math.cos((a.lat * Math.PI) / 180) *
      Math.cos((b.lat * Math.PI) / 180) *
      sinLng * sinLng;
  return R * 2 * Math.atan2(Math.sqrt(x), Math.sqrt(1 - x));
}

// En la normalización de cada ítem:
distanceFromCenter: item.geoPoint
  ? haversineKm(IGLESIA_DEL_CARMEN, item.geoPoint)
  : null,
```

### 6.3 Label del entity type desde translations

Reemplazar cualquier string hardcodeado de tipo `"Tour"` / `"Activity"` / `"Actividad"` por:

```typescript
// source = el objeto de stopover_mixed_experience_module_sources
const sourceTr = pickTranslation(source.translations, currentLang);
const entityLabel = sourceTr?.label ?? source.entity_type;
```

---

## PARTE 7 — Frontend: sistema de filtros

### 7.1 Leer toggles del módulo

```typescript
const visibleFilters = {
  language: module.filter_language_enabled,
  category: module.filter_category_enabled,
  discount: module.filter_discount_enabled,
  duration: module.filter_duration_enabled,
  distance: module.filter_distance_enabled,
};
```

Solo renderizar el control UI de un filtro si su boolean es `true`.

### 7.2 Labels de filtros desde translations

```typescript
const moduleTr = pickTranslation(module.translations, currentLang);

const filterLabels = {
  language:  moduleTr?.filter_language_label  ?? 'Idioma',
  category:  moduleTr?.filter_category_label  ?? 'Categoría',
  discount:  moduleTr?.filter_discount_label  ?? 'Descuento',
  duration:  moduleTr?.filter_duration_label  ?? 'Duración',
  distance:  moduleTr?.filter_distance_label  ?? 'Distancia al centro',
};
```

### 7.3 Apply button — estado pendiente

Los filtros usan un patrón **pending → applied** para evitar cualquier hit al servidor mientras
el usuario compone su selección. Sólo cuando hace click en "Aplicar" se actualizan los resultados.

```typescript
// Estado local del componente
let pendingFilters = { ...defaultFilters };  // lo que el usuario está cambiando en la UI
let activeFilters  = { ...defaultFilters };  // lo que realmente filtra la lista

// Cada control de UI escribe sobre pendingFilters, NUNCA sobre activeFilters directamente.

// Al hacer click en "Aplicar":
function applyFilters() {
  activeFilters = { ...pendingFilters };
}

// El label viene del CMS; fallback en cada idioma:
const applyLabel = moduleTr?.filter_apply_label ?? 'Aplicar';
```

**Reglas:**
- Los filtros **NO** se sincronizan con URL search params ni con ningún store que cause navegación.
- Todo el estado vive en variables locales del componente (`let`).
- El botón se renderiza sólo si hay al menos un filtro habilitado en el módulo.
- Al limpiar/resetear filtros, se resetea `pendingFilters` y se llama `applyFilters()` en el mismo tick.

### 7.4 Reference point label

Mostrar `moduleTr?.reference_point_label` cerca del control de distancia.
Ejemplo de valor: `"Medido desde Iglesia del Carmen, Vía España"`.

### 7.5 Lógica de cada filtro

Pipeline: `prefilter del módulo → filtros UI (AND entre filtros) → sort → corte max_items`

```typescript
// Filtro idioma — OR entre valores seleccionados
if (activeFilters.language?.length) {
  items = items.filter(item =>
    activeFilters.language.some(lang => item.supported_language?.includes(lang))
  );
}

// Filtro categoría — OR entre valores seleccionados
if (activeFilters.category?.length) {
  items = items.filter(item =>
    activeFilters.category.some(cat => item.experience_category?.includes(cat))
  );
}

// Filtro descuento — ítems con descuento >= N% (N=0 para "cualquier descuento")
if (activeFilters.discountMin != null) {
  items = items.filter(item =>
    item.promo_discount_percent != null &&
    item.promo_discount_percent >= activeFilters.discountMin
  );
}

// Filtro duración — rango min/max
if (activeFilters.durationMin != null || activeFilters.durationMax != null) {
  items = items.filter(item => {
    if (item.duration == null) return false;
    if (activeFilters.durationMin != null && item.duration < activeFilters.durationMin) return false;
    if (activeFilters.durationMax != null && item.duration > activeFilters.durationMax) return false;
    return true;
  });
}

// Filtro distancia — radio en km desde el centro
if (activeFilters.distanceMaxKm != null) {
  items = items.filter(item =>
    item.distanceFromCenter != null &&
    item.distanceFromCenter <= activeFilters.distanceMaxKm
  );
}
```

---

## PARTE 8 — Frontend: sistema de sorting

### 8.1 Opciones del selector

| Valor interno | Label (fallback si falta CMS) | ASC/DESC |
|---|---|---|
| `relevance` | "Relevancia" | NO — sort fijo |
| `discount_percent` | "Descuento" | SÍ |
| `distance_from_center` | "Distancia al centro" | SÍ |
| `duration` | "Duración" | SÍ |
| `name` | "Nombre" | SÍ |

### 8.2 Comparador

```typescript
type SortOption = 'relevance' | 'discount_percent' | 'distance_from_center' | 'duration' | 'name';
type SortDir = 'asc' | 'desc';

function sortItems(
  items: NormalizedItem[],
  sort: SortOption,
  dir: SortDir
): NormalizedItem[] {
  const d = dir === 'asc' ? 1 : -1;

  return [...items].sort((a, b) => {
    switch (sort) {

      case 'relevance':
        // Comparador original de 4 niveles — no cambia con dir
        if (b.priority !== a.priority) return b.priority - a.priority;
        if ((b.promo_discount_percent ?? -1) !== (a.promo_discount_percent ?? -1))
          return (b.promo_discount_percent ?? -1) - (a.promo_discount_percent ?? -1);
        if ((b.recency ?? 0) !== (a.recency ?? 0))
          return (b.recency ?? 0) - (a.recency ?? 0);
        return a.stableKey.localeCompare(b.stableKey);

      case 'discount_percent': {
        // desc = mayor descuento primero; asc = menor primero; nulls siempre al final
        const aVal = a.promo_discount_percent ?? (dir === 'asc' ? Infinity : -Infinity);
        const bVal = b.promo_discount_percent ?? (dir === 'asc' ? Infinity : -Infinity);
        return aVal !== bVal ? d * (bVal - aVal) : a.stableKey.localeCompare(b.stableKey);
      }

      case 'distance_from_center': {
        // asc = más cerca primero; desc = más lejos primero; nulls siempre al final
        const aVal = a.distanceFromCenter ?? Infinity;
        const bVal = b.distanceFromCenter ?? Infinity;
        return aVal !== bVal ? d * (aVal - bVal) : a.stableKey.localeCompare(b.stableKey);
      }

      case 'duration': {
        const aVal = a.duration ?? (dir === 'asc' ? Infinity : -Infinity);
        const bVal = b.duration ?? (dir === 'asc' ? Infinity : -Infinity);
        return aVal !== bVal ? d * (aVal - bVal) : a.stableKey.localeCompare(b.stableKey);
      }

      case 'name': {
        const cmp = (a.name ?? '').localeCompare(b.name ?? '', undefined, { sensitivity: 'base' });
        return cmp !== 0 ? d * cmp : a.stableKey.localeCompare(b.stableKey);
      }
    }
  });
}
```

### 8.3 Aplicar corte max_items después del sort

```typescript
const filtered = applyFilters(normalizedItems, activeFilters);
const sorted   = sortItems(filtered, activeSortOption, activeSortDir);
const displayed = sorted.slice(0, module.max_items);
```

---

## Checklist de implementación

### Directus — ✅ SCHEMA Y SEED COMPLETOS
- [x] Colección `stopover_mixed_experience_module_translations` creada con los 10 campos base
- [x] Agregar a `stopover_mixed_experience_module_translations` los 7 campos nuevos:
      `reference_point_label`, `filter_language_label`, `filter_category_label`,
      `filter_discount_label`, `filter_duration_label`, `filter_distance_label`, `filter_apply_label`
- [x] Colección `stopover_mixed_experience_module_sources` creada con `entity_type`, `max_items`, `status`, `module_id`
- [x] Crear `stopover_mixed_experience_module_sources_translations` (`label` + relaciones + alias `translations` en sources)
- [x] Agregar 5 booleans `filter_*_enabled` a `stopover_mixed_experience_module` (default true, not null)
- [x] Cargar traducciones iniciales en `sources_translations` con los labels hardcodeados actuales (6 rows)
- [x] Contenido de texto existente ya vive en `module_translations` (no requiere migración)
- [ ] Cargar valores editoriales para `filter_*_label`, `filter_apply_label`, `reference_point_label` en en/es/pt (pendiente de editor)

### Frontend
- [ ] Actualizar Zod schema `src/lib/directus/stopover_mixed_experience_module.ts`
      con los campos nuevos de translations y los 5 booleans del módulo
- [ ] Actualizar query de Directus: agregar `translations.*` y `sources.translations.*`
      (en `+page.server.ts` `buildMixedConfigQuery` y en `utils.ts` `getMixedModuleDetailsByKey` / `getFirstMixedModule`)
- [ ] Agregar al query de items (`buildMixedPromoItemsQuery` y `buildMixedSourceItemsQuery`) los campos:
      `duration`, `meeting_point` / `location`, `supported_languages`, `experience_category`, `date_created`, `id`
- [ ] Agregar helper `pickTranslation`
- [ ] Normalización: `meeting_point` / `location` → `geoPoint` (ambos son `GeoJSON`, extraer coords)
- [ ] Normalización: `duration` → siempre `number` (tours ya es number, places viene como string)
- [ ] Normalización: calcular `distanceFromCenter` con haversine (ref Iglesia del Carmen)
- [ ] Normalización: `stableKey = "${_collection}:${id}"`
- [ ] Normalización: reemplazar label hardcodeado de entity type (en componente svelte, líneas 85-105)
      por `source.translations[lang].label`
- [ ] Filtros: leer `filter_*_enabled` del módulo → mostrar/ocultar cada control
- [ ] Filtros: leer `filter_*_label` desde translations → labels de UI
- [ ] Filtros: mostrar `reference_point_label` junto al control de distancia
- [ ] Filtros: patrón pending → applied con botón "Aplicar" (sin hits al servidor)
- [ ] Filtros: `filter_apply_label` desde translations (fallback: "Aplicar" / "Apply")
- [ ] Filtros: implementar los 5 filtros con lógica AND/OR
- [ ] Sort: agregar selector con 5 opciones (ASC/DESC donde aplica, no en relevance)
- [ ] Sort: implementar función `sortItems`
- [ ] Sort: aplicar caps — primero `source.max_items` por colección, luego `module.max_items` global después del sort

---

## Notas para Cursor

- Componente principal: `src/lib/components/directus/general-components/mixed-experience-module/mixed-experience-module.svelte`.
- Merge engine vive en `src/routes/[...path]/+page.server.ts` y `src/routes/utils.ts`.
- `stableKey` se genera durante la normalización: `"stopover_tour:${item.id}"` o `"stopover_place_to_visit:${item.id}"` (usar el campo `_collection` que ya se inyecta en el merge).
- `recency` en el comparador de relevance usa `date_created`. Ambas colecciones lo tienen disponible.
- `geoPoint` viene como `GeoJSON` confirmado: `{ type: "Point", coordinates: [lng, lat] }`.
  En `haversineKm`, extraer coords así: `lng = geoPoint.coordinates[0]`, `lat = geoPoint.coordinates[1]`.
- Para el filtro de distancia: si el usuario no seleccionó ningún radio, no filtrar
  (`distanceFromCenter` calculado pero filtro inactivo).
- Caps por source (`sources.max_items`): el campo YA EXISTE en la colección sources.
  Aplicarlo antes de mezclar; si el cap es null, no aplicar cap individual.
- `experience_category` es `number | null` (M2O), NO multi-select. El filtro debe comparar por ID
  (ej. `activeFilters.category.includes(item.experience_category)`).
- `duration` requiere parseo: en `stopover_tour` viene como `number`, en `stopover_place_to_visit`
  viene como `string`. Normalizar con `Number(item.duration) || null`.
