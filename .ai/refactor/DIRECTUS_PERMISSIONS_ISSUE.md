# 🔒 Problema de Permisos de Directus - Diagnóstico Inicial (INCORRECTO)

**Fecha:** 2026-01-16  
**Estado:** ❌ DIAGNÓSTICO INCORRECTO - Ver solución real

---

## ⚠️ NOTA IMPORTANTE

**Este documento contiene el diagnóstico inicial que resultó ser INCORRECTO.**

El problema **NO era** permisos de Directus ni filtros complejos.

**Ver la solución real en:** `.ai/refactor/SOLUTION_DIRECTUS_403.md`

---

## 📊 Resumen Ejecutivo (INCORRECTO)

~~El problema NO es el código, ni los campos solicitados, sino **cómo Directus evalúa permisos cuando hay filtros complejos**.~~

**CORRECCIÓN:** El problema era que tours/packages/transportation usaban el cliente HTTP del submodule en lugar del SDK oficial de Directus.

### Situación Actual
- ✅ **Listas** funcionan perfectamente (tours, packages, transportation)
- ❌ **Detalles** fallan con 403 Forbidden

### Causa Raíz
Directus evalúa permisos de forma diferente según la complejidad de los filtros. Los detalles usan filtros muy complejos con múltiples niveles de relaciones anidadas.

---

## 🔍 Diagnóstico Detallado

### Comparación Lista vs Detalle

#### Lista (✅ Funciona)
```typescript
// Campos solicitados
fields: [
  'priority',
  'main_image',
  'promo_discount_percent',
  'promo_discount_amount',
  { translations: ['name', 'path', 'promo_name'] },
  { parent_page: pagePathFields }
]

// Filtros: SIMPLES (solo deep)
deep: {
  translations: {
    _filter: { languages_code: { _eq: locale } }
  }
}
```

#### Detalle (❌ Falla con 403)
```typescript
// MISMOS CAMPOS EXACTOS
fields: [
  'priority',
  'main_image',
  'promo_discount_percent',
  'promo_discount_amount',
  { translations: ['name', 'path', 'promo_name'] },
  { parent_page: pagePathFields }
]

// Filtros: MUY COMPLEJOS
filter: {
  _and: [
    { translations: { languages_code: { _eq: locale } } },
    { translations: { path: { _eq: article } } },
    { parent_page: { translations: { languages_code: { _eq: locale } } } },
    { parent_page: { translations: { path: { _eq: subCategory } } } },
    { parent_page: { parent: { translations: { languages_code: { _eq: locale } } } } },
    { parent_page: { parent: { translations: { path: { _eq: category } } } } },
    { parent_page: { parent: { parent: { translations: { languages_code: { _eq: locale } } } } } },
    { parent_page: { parent: { parent: { translations: { path: { _eq: locale } } } } } }
  ]
}
```

### Error de Directus
```json
{
  "message": "You don't have permission to access fields \"[\"priority\"\", \"\"main_image\"\", \"\"promo_discount_percent\"\", \"\"promo_discount_amount\"\", \"\"path\"\", \"\"promo_name\"]}\", \"\"languages_code\"\", \"\"title_tag\"]}\", \"\"title_tag\"]}]}]}]}]}]\" in collection \"stopover_tour\" or they do not exist. Queried in root.",
  "code": "FORBIDDEN"
}
```

**Observación clave:** Los mismos campos que funcionan en la lista, fallan cuando hay filtros complejos.

---

## 💡 ¿Por Qué Pasa Esto?

### Evaluación de Permisos en Directus

Directus evalúa permisos en dos contextos:

1. **Root-level** (queries simples):
   - ✅ El token tiene permisos básicos de lectura
   - ✅ Funciona para queries directas o con deep filters

2. **Complex filter evaluation** (queries con múltiples `_and` y relaciones anidadas):
   - ❌ Directus necesita permisos adicionales para evaluar filtros complejos
   - ❌ Requiere permisos en relaciones intermedias
   - ❌ Requiere permisos en campos usados en filtros (aunque no se soliciten en fields)

**El mensaje de error es confuso:** Directus dice "no tienes permisos para estos campos", pero en realidad significa "no puedes usar estos campos en filtros complejos con tu nivel de permisos actual".

---

## 🎯 Soluciones Posibles

### Opción 1: Configurar Permisos en Directus (Recomendado)

En el panel de Directus, para el rol asociado al `DIRECTUS_TOKEN`:

#### Permisos Necesarios para `stopover_tour`:
- ✅ **Read** en todos los campos:
  - `id`, `priority`, `main_image`
  - `promo_discount_amount`, `promo_discount_percent`, `promo_code`
  - `duration`, `start_time`, `meeting_point`, `end_point`
  - `category`, `supported_languages`, `pilar`
  - `parent_page` (relación)

#### Permisos Necesarios para Relaciones:
- ✅ **`stopover_tour_translations`** (colección de traducciones):
  - `languages_code`, `path`, `name`, `promo_name`
  - `description`, `experience`, `included`, `not_included`, `url`
  
- ✅ **`pages`** (relación parent_page):
  - `id`, `translations`
  
- ✅ **`pages_translations`**:
  - `languages_code`, `path`, `title_tag`

- ✅ **`operators`** (operadores de tours):
  - `name`, `main_image`, `contact`, `network`

- ✅ **`directus_files`** (para imágenes y gallery):
  - `id`, `filename_download`, `title`, etc.

#### Configuración Recomendada:
```
Role: API Static Token
Collection: stopover_tour
Permissions: Read
Fields: All (o específicamente los listados arriba)
Conditions: None (o filtros específicos si es necesario)
```

**Mismo setup para:** `stopover_package`, `stopover_transportation`

---

### Opción 2: Usar Solo Permisos Públicos (Solo para DEV)

Si en desarrollo, puedes hacer las colecciones públicas temporalmente:

```
Settings → Roles & Permissions → Public
Collection: stopover_tour
Action: Read
Fields: All
```

⚠️ **NO recomendado para producción**

---

### Opción 3: Simplificar los Filtros (Workaround de Código)

Cambiar la estrategia de fetching:
1. Obtener el `page` primero
2. Usar el `page.id` para filtrar directamente en lugar de filtrar por paths anidados

```typescript
// Paso 1: Obtener la página
const page = await getPage({ locale, category, subCategory, article });

// Paso 2: Filtrar tours por page.id (más simple)
const tours = await getManyStopoverTour(DIRECTUS_REST_URL, DIRECTUS_TOKEN, {
  fields: [...],
  filter: {
    parent_page: { _eq: page.id }  // ✅ Filtro simple
  }
});
```

**Ventajas:**
- ✅ Filtro más simple
- ✅ Menos evaluación de permisos
- ✅ Probablemente funcionará

**Desventajas:**
- ❌ Requiere 2 queries en lugar de 1
- ❌ Más refactoring de código

---

### Opción 4: Usar el SDK Oficial con Token Admin (Temporal)

Para el build SSG, usar un token con permisos completos:

```bash
# .env
DIRECTUS_TOKEN=token_con_permisos_completos_aqui
```

---

## 🚀 Recomendación

**Para el proyecto en producción:**

1. ✅ **Opción 1: Configurar permisos correctos en Directus**
   - Es la solución correcta y permanente
   - Permite control granular de permisos
   - No requiere cambios de código

2. ⚠️ **Opción 3: Simplificar filtros** (si #1 no es posible)
   - Solo si no puedes modificar permisos en Directus
   - Requiere refactoring pero funciona

**Para desarrollo local:**

1. Usa **Opción 2** (público) o **Opción 4** (token admin) temporalmente
2. Luego configura **Opción 1** para producción

---

## 📝 Archivos Afectados

### Archivos que usan filtros complejos:
- `src/lib/directus/tours/index.ts`
- `src/lib/directus/package/index.ts`
- `src/lib/directus/transportation/index.ts`

### Archivos que funcionan (para referencia):
- `src/routes/utils.ts` (buildModuleQuery - listas)
- `src/lib/directus/hotelRequests.ts`
- `src/lib/directus/restaurantRequest.ts`
- `src/lib/directus/placeRequest.ts`

---

## ✅ Próximos Pasos

1. **Verificar permisos actuales en Directus:**
   - Ir a Settings → Roles & Permissions
   - Revisar el rol asociado al token actual
   - Ver qué colecciones y campos tienen permisos

2. **Aplicar la Opción 1:**
   - Dar permisos de lectura completos a las colecciones mencionadas
   - Incluir permisos en relaciones y traducciones
   - Guardar cambios

3. **Probar de nuevo:**
   - `pnpm dev` → Navegar a tour detail
   - `pnpm build` → Verificar que build SSG funcione

4. **Si Opción 1 no es posible:**
   - Implementar Opción 3 (simplificar filtros)
   - Requiere refactoring de `getPublishedTours`, `getPublishedPackages`, `getPublishedTransportation`

---

## 📚 Referencias

- **Error logs:** `\home\caparturo\.cursor\...\terminals\4.txt`
- **Código de lista (funciona):** `src/routes/utils.ts:101-140`
- **Código de detalle (falla):** `src/lib/directus/tours/index.ts:24-69`
- **Directus Permissions Docs:** https://docs.directus.io/configuration/permissions/

---

## 💬 Conclusión

El código está **100% correcto**. El problema es una configuración de permisos en Directus que evalúa queries complejas de forma más restrictiva que queries simples.

**Solución más limpia:** Configurar permisos correctos en Directus (Opción 1).

**Solución alternativa:** Simplificar la lógica de filtros (Opción 3).
