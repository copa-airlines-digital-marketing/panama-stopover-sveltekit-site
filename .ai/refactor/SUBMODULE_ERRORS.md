# 🔴 Errores en Submodules - Acción Requerida

**Fecha:** 2026-01-16  
**Prioridad:** Alta - Estos errores deben corregirse en los repositorios de los submodules

---

## 📦 Resumen de Errores

| Submodule | Errores | Tipo Principal |
|-----------|---------|----------------|
| **design-sytem-svelte-components** | 7 | Type constraint errors |
| **directus-cms-collections** | 47+ | Import syntax + missing types |

---

## 🎨 design-sytem-svelte-components

### Archivo: `src/lib/components/typography/index.ts`

**Total de errores:** 7

#### Problema: Type constraints no satisfechas

Todos los errores son del tipo: `Type '...' does not satisfy the constraint 'never'`

**Líneas con error:**

1. **Línea 106:**
   ```
   Type '"display" | "h1" | "h2" | "h3" | "h4" | "display-big" | "display-small" | "display-tiny"'
   does not satisfy the constraint 'never'
   ```

2. **Línea 113:**
   ```
   Type '"body" | "body-large" | "body-small"'
   does not satisfy the constraint 'never'
   ```

3. **Línea 114:**
   ```
   Type '"body" | "body-emphasis" | "body-invert" | "body-invert-emphasis"'
   does not satisfy the constraint 'never'
   ```

4. **Línea 120:**
   ```
   Type '"caption" | "caption-large" | "caption-small" | "caption-tiny"'
   does not satisfy the constraint 'never'
   ```

5. **Línea 123:**
   ```
   Type '"caption" | "caption-secondary" | "caption-invert" | "caption-invert-secondary"'
   does not satisfy the constraint 'never'
   ```

6. **Línea 130:**
   ```
   Type '"overline" | "overline-small"'
   does not satisfy the constraint 'never'
   ```

7. **Línea 135:**
   ```
   Type '"link" | "link-invert" | "link-secondary"'
   does not satisfy the constraint 'never'
   ```

### Posible Causa
Parece que hay un problema con los tipos genéricos en la definición de componentes de tipografía. Probablemente hay un `Exclude` o `Omit` que está removiendo todos los valores posibles, dejando solo `never`.

### Recomendación
Revisar las definiciones de tipos en `typography/index.ts` alrededor de las líneas indicadas. Buscar tipos genéricos o condicionales que puedan estar filtrando incorrectamente los valores permitidos.

---

## 📊 directus-cms-collections

### Categoría 1: Import Syntax Errors (verbatimModuleSyntax)

**Total:** ~30 errores  
**Tipo:** `error TS1484: '...' is a type and must be imported using a type-only import when 'verbatimModuleSyntax' is enabled.`

#### Archivos afectados:

1. **`src/collections/sections/index.ts`**
   - Línea 1: `Query` debe ser `type Query`
   - Línea 3: `TextContent` debe ser `type TextContent`

2. **`src/collections/sites/index.ts`**
   - Línea 1: `Query` debe ser `type Query`
   - Línea 1: `QueryItem` debe ser `type QueryItem`

3. **`src/collections/stopover_package/index.ts`**
   - Línea 1: `Query` debe ser `type Query`
   - Línea 1: `QueryItem` debe ser `type QueryItem`
   - Línea 2: `StopoverPackage` debe ser `type StopoverPackage`
   - Línea 4: `StopoverPackageFiles` debe ser `type StopoverPackageFiles`
   - Línea 5: `StopoverPackageTranslation` debe ser `type StopoverPackageTranslation`

4. **`src/collections/stopover_package/stopover_package.ts`**
   - Línea 1: `Page` debe ser `type Page`
   - Línea 2: `StopoverPackageFiles` debe ser `type StopoverPackageFiles`
   - Línea 3: `StopoverPackageTranslation` debe ser `type StopoverPackageTranslation`

5. **`src/collections/stopover_package/stopover_package_files.ts`**
   - Línea 1: `StopoverPackage` debe ser `type StopoverPackage`

6. **`src/collections/stopover_package/stopover_package_translations.ts`**
   - Línea 1: `Languages` debe ser `type Languages`
   - Línea 2: `StopoverPackage` debe ser `type StopoverPackage`

7. **`src/collections/stopover_transportation/files.ts`**
   - Línea 1: `StopoverTransportation` debe ser `type StopoverTransportation`

8. **`src/collections/stopover_transportation/index.ts`**
   - Línea 1: `Query` debe ser `type Query`
   - Línea 1: `QueryItem` debe ser `type QueryItem`
   - Línea 2: `Page` debe ser `type Page`
   - Línea 3: `StopoverTransportationFiles` debe ser `type StopoverTransportationFiles`
   - Línea 4: `StopoverTransportationTranslations` debe ser `type StopoverTransportationTranslations`

9. **`src/collections/stopover_transportation/translations.ts`**
   - Línea 1: `Languages` debe ser `type Languages`
   - Línea 2: `StopoverTransportation` debe ser `type StopoverTransportation`

10. **`src/index.ts`**
    - Línea 3: `Query` debe ser `type Query`
    - Línea 4: `QueryItem` debe ser `type QueryItem`
    - Línea 10: `StopoverTour` debe ser `type StopoverTour`

### Fix Ejemplo:

```typescript
// ❌ INCORRECTO
import { Query, QueryItem } from '@directus/sdk';

// ✅ CORRECTO
import type { Query, QueryItem } from '@directus/sdk';
```

### Causa
El proyecto principal tiene `verbatimModuleSyntax: true` en el `tsconfig.json`, lo que requiere que todos los tipos se importen explícitamente con `type`.

### Recomendación
Actualizar todos los imports de tipos para usar `import type { ... }` en lugar de `import { ... }`.

---

### Categoría 2: Missing Type Definitions

**Total:** ~15 errores  
**Tipo:** `error TS2304: Cannot find name '...'`

#### Tipos faltantes:

1. **`PagesStorefronts`** (3 ocurrencias)
   - `src/collections/pages/pages.ts:4`
   - `src/collections/sections/index.ts:90`

2. **`PagesTranslations`** (1 ocurrencia)
   - `src/collections/pages/pages.ts:5`

3. **`Sections`** (4 ocurrencias)
   - `src/collections/sections/index.ts:96`
   - `src/collections/sections/index.ts:101`
   - `src/collections/sections/index.ts:108`
   - `src/collections/sections/index.ts:113`

4. **`Sites`** (4 ocurrencias)
   - `src/collections/sites/index.ts:7`
   - `src/collections/sites/index.ts:12`
   - `src/collections/sites/index.ts:20`
   - `src/collections/sites/index.ts:25`

5. **`Languages`** (1 ocurrencia)
   - `src/collections/text_content/index.ts:8`

### Causa
Estos tipos probablemente deberían estar definidos en el schema de Directus pero no están siendo exportados o no existen.

### Recomendación
1. Verificar si estos tipos deben generarse desde el schema de Directus
2. Definir manualmente los tipos faltantes si no están en el schema
3. Verificar que el schema esté actualizado

---

### Categoría 3: Module Resolution Errors

**Total:** 1 error  
**Tipo:** `error TS2306: File '...' is not a module`

#### Error:

**`src/utils.ts:2`**
```
File '/home/caparturo/code/copa-airlines/panama-stopover-sveltekit-site/directus-cms-collections/src/collections/schema.d.ts' is not a module
```

### Causa
El archivo `schema.d.ts` probablemente no tiene exports o tiene una estructura incorrecta.

### Recomendación
1. Verificar que `schema.d.ts` tenga al menos un export
2. Si es un ambient module, debería tener la estructura correcta:
   ```typescript
   declare module 'nombre' {
     export type Schema = { ... };
   }
   ```
3. O usar `export {}` al final si es un archivo de tipos global

---

## 🎯 Plan de Acción Recomendado

### Para design-sytem-svelte-components:

1. **Prioridad Alta** - Corregir errores de type constraints
   - Revisar `src/lib/components/typography/index.ts`
   - Buscar tipos genéricos que estén evaluando a `never`
   - Probablemente hay un `Exclude` o tipo condicional mal configurado

### Para directus-cms-collections:

1. **Prioridad Alta** - Fix import syntax
   - Usar script de find/replace para cambiar todos los imports:
     ```bash
     # En el repo del submodule
     find src -name "*.ts" -type f -exec sed -i 's/^import { \(Query\|QueryItem\)/import type { \1/g' {} +
     ```
   - O manualmente revisar cada archivo listado arriba

2. **Prioridad Alta** - Definir tipos faltantes
   - Crear o actualizar definiciones para:
     - `PagesStorefronts`
     - `PagesTranslations`
     - `Sections`
     - `Sites`
     - `Languages`

3. **Prioridad Media** - Fix schema.d.ts
   - Asegurar que sea un módulo válido con exports

---

## 📝 Checklist de Corrección

### design-sytem-svelte-components
- [ ] Revisar línea 106 de `typography/index.ts`
- [ ] Revisar línea 113 de `typography/index.ts`
- [ ] Revisar línea 114 de `typography/index.ts`
- [ ] Revisar línea 120 de `typography/index.ts`
- [ ] Revisar línea 123 de `typography/index.ts`
- [ ] Revisar línea 130 de `typography/index.ts`
- [ ] Revisar línea 135 de `typography/index.ts`
- [ ] Correr `npm run type-check` para verificar
- [ ] Commit y push cambios
- [ ] Actualizar submodule reference en el proyecto principal

### directus-cms-collections
- [ ] Cambiar todos los imports de tipos a `import type`
- [ ] Definir `PagesStorefronts` type
- [ ] Definir `PagesTranslations` type
- [ ] Definir `Sections` type
- [ ] Definir `Sites` type
- [ ] Definir `Languages` type
- [ ] Corregir `schema.d.ts` para que sea un módulo válido
- [ ] Correr `npm run type-check` para verificar
- [ ] Commit y push cambios
- [ ] Actualizar submodule reference en el proyecto principal

---

## 🔄 Actualizar Submodules en el Proyecto Principal

Una vez corregidos los errores en los submodules:

```bash
# En el proyecto principal
cd design-sytem-svelte-components
git pull origin main  # o la branch correcta

cd ../directus-cms-collections
git pull origin main  # o la branch correcta

cd ..
git add design-sytem-svelte-components directus-cms-collections
git commit -m "chore: update submodules with type fixes"
```

---

## 📊 Impacto Estimado

- **Tiempo estimado de corrección:** 2-4 horas
- **Complejidad:** Media
- **Impacto:** Alto - Reducirá errores de ~241 a ~194 (eliminando ~47 errores de submodules)

---

## 💡 Notas Adicionales

1. **No son errores del refactor:** Estos errores ya existían antes del refactor de dominios.

2. **Bloquean el desarrollo:** Aunque el código funciona, tener tantos errores dificulta ver errores reales.

3. **Type safety:** Corregir estos errores mejorará significativamente la type safety del proyecto.

4. **CI/CD:** Si tienen CI/CD con type checking, probablemente está fallando actualmente.

---

**Una vez corregidos estos errores, podremos continuar con la migración de loaders y componentes con un proyecto mucho más limpio.** 🚀
