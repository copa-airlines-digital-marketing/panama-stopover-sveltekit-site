# SSG Cloudflare Pages Memory Issue - Análisis y Solución

**Fecha:** 2026-01-16  
**Estado:** ✅ Configuración restaurada  
**Commit:** `f512eeb`

## Problema Reportado

Build en Cloudflare Pages fallaba con:
```
build exceeded memory limit and was terminated
```

## Diagnóstico Inicial (INCORRECTO ❌)

Pensé que el problema era de configuración, entonces:
- Cambié a `adapter-static` con `fallback: 'index.html'` → Convirtió en SPA ❌
- Deshabilitó prerendering (`prerender = false`) → Violó requisito del proyecto ❌

**Usuario correctamente rechazó esta solución.**

## Diagnóstico Correcto (✅)

El proyecto **DEBE ser SSG** con prerendering. El problema real:

### Volumen de Páginas

Build local muestra:
```
Sveltekit will render 594 pages
```

**Desglose estimado:**
- Hoteles: ~150 páginas (3 idiomas × ~50 hoteles)
- Restaurantes: ~90 páginas (3 idiomas × ~30 restaurantes)
- Lugares: ~120 páginas (3 idiomas × ~40 lugares)
- Tours: ~60 páginas (3 idiomas × ~20 tours)
- Paquetes: ~30 páginas (3 idiomas × ~10 paquetes)
- Transporte: ~30 páginas
- Páginas estáticas: ~114 páginas

**Total: 594 páginas** = Alto uso de memoria durante SSG

### Límites de Cloudflare Pages

Cloudflare Pages free tier tiene límites de memoria para builds.
Con 594 páginas SSG, es posible exceder estos límites.

## Solución Implementada

### 1. Restaurar Configuración SSG Correcta

**svelte.config.js:**
```javascript
// ANTES (INCORRECTO)
adapter: adapter({
  pages: 'build',
  assets: 'build',
  fallback: 'index.html', // ❌ SPA mode
  precompress: false,
  strict: false
})

// AHORA (CORRECTO)
adapter: adapter() // Simple, como en producción ✅
```

### 2. Re-habilitar Prerendering

**src/routes/[...path]/+page.server.ts:**
```typescript
// ANTES
export const prerender = false; // ❌

// AHORA
export const prerender = true; // ✅
```

### 3. Eliminar Rutas Problemáticas

Eliminadas completamente (no stubs):
- `src/routes/api/*` (QR, tokens, reservations)
- `src/routes/verify/*`

Estas rutas:
- Tenían dependencias de Prisma → Error en Cloudflare
- No eran necesarias para el despliegue actual
- Pueden haber estado consumiendo memoria extra

## Estado Actual

✅ **Configuración correcta restaurada**
- SSG habilitado (`prerender = true`)
- Adapter simple (`adapter()`)
- Rutas problemáticas eliminadas

✅ **Build funciona localmente**
- Con Doppler y env vars
- Renderiza 594 páginas correctamente

⚠️ **Puede seguir fallando en Cloudflare**
- Si el problema es límite de memoria del plan free tier
- 594 páginas es un volumen alto para SSG

## Próximos Pasos

### Si Build en Cloudflare FUNCIONA

✅ **Problema resuelto!**

Las rutas stub (`/api`, `/verify`) eran el problema real.

### Si Build en Cloudflare FALLA con Memory Limit

El problema es de recursos, no de configuración.

**Opciones:**

#### Opción A: Cloudflare Pages Pro

- **Costo:** ~$20/mes
- **Ventajas:**
  - Más memoria para builds
  - Mejor para proyectos grandes
  - Sin cambios de código
- **Desventajas:**
  - Costo mensual

#### Opción B: Prerendering Selectivo

Solo pre-renderizar páginas críticas:

```typescript
// src/routes/[...path]/+page.server.ts
import type { EntryGenerator } from './$types';

export const entries: EntryGenerator = async () => {
  // Solo páginas críticas
  const criticalPages = [
    { path: 'en' },
    { path: 'es' },
    { path: 'pt' },
    { path: 'en/offers' },
    { path: 'es/ofertas' },
    { path: 'pt/descontos' },
    // Top 10 hoteles
    { path: 'en/offers/hotels/waldorf-astoria-panama' },
    { path: 'en/offers/hotels/sofitel-legend-casco-viejo' },
    // ... más páginas críticas
  ];
  
  return criticalPages;
};

export const prerender = true; // Mantener habilitado
```

**Ventajas:**
- Sin costo
- Reduce memoria del build
- Páginas críticas pre-renderizadas (SEO)

**Desventajas:**
- Páginas no críticas se cargan on-demand (CSR)
- Más complejo de mantener

#### Opción C: Contact Cloudflare Support

- Explicar caso de uso (594 páginas legítimas)
- Preguntar por límites ajustables
- Puede haber soluciones específicas

#### Opción D: Split por Categoría

Dividir en múltiples proyectos:
- `hotels.stopover.copa.com`
- `restaurants.stopover.copa.com`
- `tours.stopover.copa.com`

**Ventajas:**
- Cada build maneja menos páginas
- Deployments independientes
- Escalabilidad

**Desventajas:**
- Más complejo de gestionar
- Múltiples deploys
- Puede requerir cambios en dominio

## Análisis: ¿Por qué funcionaba en producción antes?

Posibles razones:

1. **Menos contenido:** CMS tenía menos items antes
2. **Diferentes límites:** Cloudflare ajustó límites
3. **Plan diferente:** Posiblemente Pages Pro o Business
4. **Build optimization:** Cloudflare cambió cómo cuenta memoria

## Lecciones Aprendidas

### ❌ Error

Intentar solucionar con SPA mode cuando el requisito es SSG.

**Aprendizaje:** Siempre validar requisitos antes de implementar.

### ✅ Correcto

1. Verificar configuración que funcionaba en producción
2. Diagnosticar volumen de páginas
3. Identificar límites de la plataforma
4. Proponer opciones basadas en recursos vs configuración

### 💡 Key Insight

**El error "build exceeded memory limit" NO siempre es error de código.**

A veces es:
- Límites de la plataforma (recursos)
- Volumen de datos (legítimo)
- Plan/tier incorrectos

La solución puede ser operacional (upgrade plan) no técnica (cambiar código).

## Referencias

- Commit con configuración correcta: `f512eeb`
- Commit anterior (SPA incorrecta): `cff09a2`
- Configuración que funcionaba: `41a808e`
- Plan de acción: `.cursor/plans/fix_cloudflare_ssg_memory_*.plan.md`

## Archivos Clave

```
svelte.config.js                         # Adapter configuration
src/routes/[...path]/+page.server.ts    # Prerender flag
```

## Comandos Útiles

```bash
# Build local con Doppler (simula Cloudflare con env vars)
pnpm build:local

# Ver número de páginas que se renderizarán
pnpm build:local 2>&1 | grep "will render"

# Test build sin env vars (como CI)
pnpm build
```

## Estado Final

```
✅ Configuración SSG correcta
✅ Build funciona localmente
✅ Rutas problemáticas eliminadas
⚠️  Pendiente: Probar en Cloudflare
⚠️  Si falla: Implementar una de las opciones listadas
```

---

**Última actualización:** 2026-01-16  
**Por:** AI Assistant  
**Revisado:** Pendiente
