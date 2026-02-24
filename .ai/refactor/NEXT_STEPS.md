# 🚀 Próximos Pasos - Refactor de Dominios

**Fecha:** 2026-01-16  
**Estado Actual:** ✅ Todos los dominios principales implementados

---

## ✅ Completado

### Fase 1: Infraestructura Base
- ✅ Consolidación de Directus client y utils
- ✅ Migración de rutas desde `src/lib/[backtoroutes]/`
- ✅ Estructura de dominios establecida

### Fase 2: Implementación de Dominios
- ✅ Hotels
- ✅ Restaurants
- ✅ Places
- ✅ Pages (con soporte para breadcrumbs y paths recursivos)
- ✅ Packages (con ViewModels Card y Detail)
- ✅ Tours (con ViewModels Card y Detail)
- ✅ Transportation (con ViewModels Card y Detail)

### Fase 3: Documentación
- ✅ `src/lib/domain/README.md` - Patrón DDD
- ✅ `COMPONENT_TYPING_GUIDE.md` - Guía de migración de componentes
- ✅ `DOMAINS_COMPLETE.md` - Resumen de dominios implementados

---

## 🎯 Siguiente Fase: Migración de Page Loaders

### 1. Actualizar `src/routes/[...path]/+page.server.ts`

**Objetivo:** Usar los nuevos query builders y mappers

**Ejemplo de migración:**

```typescript
// ANTES
import { getItems } from '$lib/directus/utils';
const hotels = await getItems(directus, 'stopover_hotels', {
  fields: ['id', 'name', /* ... */],
  filter: { /* ... */ }
});

// DESPUÉS
import { buildHotelQuery, mapDirectusHotelToViewModel } from '$lib/domain/hotels';
const query = buildHotelQuery(locale);
const rawHotels = await getItems(directus, 'stopover_hotels', query);
const hotels = rawHotels.map(h => mapDirectusHotelToViewModel(h, locale)).filter(Boolean);
```

### Archivos a migrar:
1. `src/routes/[...path]/+page.server.ts` - Loader principal
2. `src/routes/verify/+page.server.ts` - Verificación
3. Cualquier otro loader que use Directus directamente

---

## 🎨 Siguiente Fase: Migración de Componentes

### 2. Actualizar Componentes para Usar ViewModels

**Seguir la guía:** `COMPONENT_TYPING_GUIDE.md`

**Proceso:**
1. Identificar componentes que usan tipos Directus directamente
2. Actualizar props para usar ViewModels
3. Actualizar lógica interna si es necesario
4. Testear el componente

**Ejemplo:**

```typescript
// ANTES
import type { StopoverHotel } from '$cms/collections/stopover_hotels';
export let hotel: StopoverHotel;

// DESPUÉS
import type { HotelCardViewModel } from '$lib/domain/hotels';
export let hotel: HotelCardViewModel;
```

### Componentes prioritarios:
- Cards (HotelCard, RestaurantCard, PlaceCard, etc.)
- Detail pages (HotelDetail, RestaurantDetail, etc.)
- Listas y filtros

---

## 🧹 Siguiente Fase: Limpieza de Código Legacy

### 3. Deprecar y Remover Código Antiguo

**Una vez que todo esté migrado:**

1. **Remover archivos legacy:**
   ```bash
   # Revisar y remover si ya no se usan:
   src/lib/directus/hotelRequests.ts
   src/lib/directus/restaurantRequest.ts
   src/lib/directus/placeRequest.ts
   src/lib/directus/package/
   src/lib/directus/tours/
   src/lib/directus/transportation/
   ```

2. **Actualizar imports en toda la app:**
   - Buscar todos los imports de `$lib/directus/*`
   - Reemplazar con imports de `$lib/domain/*`

3. **Limpiar tipos legacy:**
   - Remover exports de compatibilidad en `index.ts`
   - Actualizar `app.d.ts` si es necesario

---

## 🔍 Siguiente Fase: Testing y Validación

### 4. Validar el Refactor

1. **Testing manual:**
   - Navegar por todas las páginas principales
   - Verificar que los datos se muestren correctamente
   - Probar filtros y búsquedas

2. **Testing automatizado (si aplica):**
   - Unit tests para mappers
   - Integration tests para loaders
   - E2E tests para flujos críticos

3. **Performance:**
   - Verificar que no haya regresiones de performance
   - Optimizar queries si es necesario

---

## 📊 Métricas de Progreso

### Dominios Implementados: 7/7 ✅
- Hotels ✅
- Restaurants ✅
- Places ✅
- Pages ✅
- Packages ✅
- Tours ✅
- Transportation ✅

### Page Loaders Migrados: 0/~5 ⏳
- [ ] `src/routes/[...path]/+page.server.ts`
- [ ] `src/routes/verify/+page.server.ts`
- [ ] Otros loaders...

### Componentes Migrados: 0/~20 ⏳
- [ ] HotelCard
- [ ] RestaurantCard
- [ ] PlaceCard
- [ ] PackageCard
- [ ] TourCard
- [ ] TransportationCard
- [ ] Otros componentes...

### Código Legacy Removido: 0% ⏳

---

## 🎯 Prioridades

### Alta Prioridad
1. ✅ Implementar todos los dominios
2. ⏳ Migrar page loaders principales
3. ⏳ Migrar componentes de cards

### Media Prioridad
4. ⏳ Migrar componentes de detalle
5. ⏳ Actualizar filtros y búsquedas
6. ⏳ Testing manual completo

### Baja Prioridad
7. ⏳ Remover código legacy
8. ⏳ Testing automatizado
9. ⏳ Optimizaciones de performance

---

## 💡 Notas Importantes

1. **Migración Gradual:** No es necesario migrar todo de una vez. El código legacy y nuevo pueden coexistir.

2. **Type Safety:** Los nuevos dominios tienen validación runtime con Zod. Cualquier dato inválido será detectado.

3. **Compatibilidad:** Los exports legacy se mantienen para compatibilidad retroactiva.

4. **Submodules:** Recordar que los submodules son read-only. No modificar archivos en:
   - `design-sytem-svelte-components/`
   - `directus-cms-collections/`

---

## 🆘 Problemas Comunes

### Error: "Cannot find module '$lib/domain/...'"
- Verificar que el dominio esté exportado en `index.ts`
- Verificar que el path alias esté configurado en `svelte.config.js`

### Error: "Type 'X' is not assignable to type 'Y'"
- Usar los ViewModels en lugar de tipos Directus directos
- Verificar que el mapper esté aplicado correctamente

### Error: "Invalid data from Directus"
- El schema de Zod está detectando datos inválidos
- Revisar la query de Directus
- Verificar que los campos solicitados existan en Directus

---

**¡Siguiente paso recomendado:** Migrar `src/routes/[...path]/+page.server.ts` para usar los nuevos dominios.
