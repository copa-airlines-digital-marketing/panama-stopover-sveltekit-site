# Estructura del Repositorio - Panama Stopover SvelteKit Site

## Información General

- **Framework**: SvelteKit 2.0 con Svelte 4
- **Tipo de Build**: Static Site Generation (SSG) para Cloudflare Pages
- **Package Manager**: pnpm (versión 10.17.1)
- **TypeScript**: Modo estricto habilitado
- **CMS**: Directus (todos los datos provienen de Directus)
- **Estilos**: Tailwind CSS 4 con presets de submódulos

## Estructura de Directorios

```
panama-stopover-sveltekit-site/
├── .github/
│   └── workflows/          # GitHub Actions para deployment
├── design-sytem-svelte-components/  # SUBMÓDULO: Componentes base de Copa Airlines
│   ├── src/lib/components/ # Componentes base reutilizables
│   └── tailwind-presets/    # SUBMÓDULO ANIDADO: Presets de Tailwind CSS
│       └── v4/
│           └── theme.css    # Tema base de Tailwind CSS 4
├── directus-cms-collections/  # SUBMÓDULO: Tipos y esquemas de Directus
│   └── src/
│       └── collections/    # Definiciones de tipos de colecciones Directus
├── src/
│   ├── app.css             # Estilos principales + extensiones de tema Tailwind
│   ├── app.d.ts             # Tipos globales de App (PageData, Locals, etc.)
│   ├── app.html             # Template HTML base
│   ├── lib/                 # Código de la aplicación
│   │   ├── [backtoroutes]/  # Rutas API y páginas especiales
│   │   │   ├── api/         # Endpoints API
│   │   │   │   ├── qr/      # Generación de códigos QR
│   │   │   │   └── reservations/  # API de reservaciones
│   │   │   └── verify/      # Página de verificación
│   │   ├── components/      # Componentes de la aplicación
│   │   │   ├── directus/    # Componentes que traducen esquemas Directus
│   │   │   │   ├── blocks/  # Bloques de contenido
│   │   │   │   ├── general-components/  # Componentes generales
│   │   │   │   ├── section/ # Componentes de secciones
│   │   │   │   ├── sites/   # Componentes de estructura de sitio
│   │   │   │   └── stopover/  # Páginas específicas de stopover
│   │   │   ├── site/        # Componentes específicos del sitio
│   │   │   │   ├── content-group/  # Grupos de contenido
│   │   │   │   ├── items/   # Items reutilizables (hero, cards, maps, etc.)
│   │   │   │   ├── navigation/  # Componentes de navegación
│   │   │   │   └── text-content/  # Variantes de contenido de texto
│   │   │   ├── testing/     # Componentes solo para testing
│   │   │   └── ui/         # Componentes UI básicos (alerts, cards, modals, etc.)
│   │   ├── core/           # Configuración y utilidades core
│   │   │   ├── config/     # Configuraciones (cookies, i18n)
│   │   │   ├── constants/  # Constantes de la aplicación
│   │   │   └── utils/      # Utilidades core (cn, tv, etc.)
│   │   ├── data/           # Capa de acceso a datos
│   │   │   ├── pages/      # Helpers para datos de páginas
│   │   │   └── site-settings.ts
│   │   ├── directus/       # Helpers para consultas Directus (legacy)
│   │   │   ├── schemas/    # Esquemas Zod para validación
│   │   │   ├── package/    # Tipos y helpers de paquetes
│   │   │   ├── tours/      # Tipos y helpers de tours
│   │   │   └── transportation/  # Tipos y helpers de transporte
│   │   ├── domain/         # Capa de dominio (Domain-Driven Design)
│   │   │   ├── hotels/     # Dominio de hoteles
│   │   │   │   ├── repository.ts  # Repositorio del dominio
│   │   │   │   ├── types.ts       # Tipos del dominio
│   │   │   │   └── index.ts       # Exports públicos
│   │   │   ├── packages/   # Dominio de paquetes
│   │   │   ├── pages/      # Dominio de páginas
│   │   │   ├── places/     # Dominio de lugares
│   │   │   ├── restaurants/  # Dominio de restaurantes
│   │   │   ├── sections/   # Dominio de secciones
│   │   │   ├── tours/      # Dominio de tours
│   │   │   └── transportation/  # Dominio de transporte
│   │   ├── infrastructure/  # Capa de infraestructura
│   │   │   ├── crypto/     # Utilidades de criptografía
│   │   │   ├── directus/  # Cliente y utilidades Directus
│   │   │   │   ├── client.ts      # Cliente Directus configurado
│   │   │   │   ├── schema.d.ts    # Schema local para queries
│   │   │   │   └── utils.ts       # Helpers de queries (getItem, getItems)
│   │   │   └── prisma/     # Cliente Prisma
│   │   ├── server/         # Utilidades del servidor
│   │   │   ├── queries/   # Queries de base de datos
│   │   │   ├── crypto.ts
│   │   │   ├── prisma.ts
│   │   │   └── verify-helpers.ts
│   │   ├── cookies/        # Helpers de cookies
│   │   ├── constants.ts    # Constantes globales
│   │   ├── i18n/          # Internacionalización
│   │   └── utils.ts        # Utilidades generales
│   └── routes/             # Rutas de SvelteKit
│       ├── [...path]/      # Ruta catch-all para páginas dinámicas
│       │   ├── +page.server.ts  # Load function para datos
│       │   ├── +page.svelte     # Componente de página
│       │   └── +page.ts         # Page data types
│       ├── +layout.server.ts    # Layout load function
│       ├── +layout.svelte       # Layout principal
│       ├── +error.svelte        # Página de error
│       ├── healthcheck/         # Endpoint de health check
│       └── utils.ts             # Utilidades de rutas
├── static/                 # Archivos estáticos
│   └── fonts/             # Fuentes locales
├── prisma/                 # Schema y migraciones de Prisma
├── .gitmodules             # Configuración de submódulos
├── package.json
├── pnpm-lock.yaml
├── tsconfig.json           # Configuración TypeScript estricta
├── svelte.config.js        # Configuración SvelteKit
├── vite.config.ts          # Configuración Vite
├── postcss.config.js       # Configuración PostCSS para Tailwind
└── eslint.config.js        # Configuración ESLint
```

## Submódulos

### 1. `directus-cms-collections/`
- **Propósito**: Contiene las definiciones de tipos TypeScript para las colecciones de Directus
- **Path Alias**: `$cms`
- **Uso**: 
  - Importar tipos base de colecciones: `import type { StopoverTour } from '$cms/collections/stopover_tours/stopover_tours'`
  - El Schema base se usa para tipar el cliente Directus
- **IMPORTANTE**: 
  - Solo contiene tipos de colecciones, NO tipos de requests
  - Los tipos de requests se infieren de las queries realizadas en este repositorio
  - NO editar código dentro de este submódulo

### 2. `design-sytem-svelte-components/`
- **Propósito**: Componentes base reutilizables de Copa Airlines
- **Path Alias**: `$ui`
- **Uso**: Importar componentes base: `import { Button } from '$ui/components/button'`
- **Submódulo anidado**: `tailwind-presets/`
  - Contiene los presets de Tailwind CSS 4
  - Se importa en `src/app.css`: `@import '../design-sytem-svelte-components/tailwind-presets/v4/theme.css'`
- **IMPORTANTE**: NO editar código dentro de este submódulo

## Path Aliases (TypeScript/Vite)

- `$lib` → `./src/lib`
- `$cms` → `./directus-cms-collections/src`
- `$ui` → `./design-sytem-svelte-components/src/lib`

## Arquitectura

### Domain-Driven Design (DDD)

El proyecto sigue una arquitectura en capas:

1. **Domain Layer** (`src/lib/domain/`)
   - Contiene la lógica de negocio
   - Cada dominio tiene: `repository.ts`, `types.ts`, `index.ts`
   - Ejemplo: `domain/hotels/repository.ts` contiene la lógica para obtener hoteles

2. **Infrastructure Layer** (`src/lib/infrastructure/`)
   - Integraciones con servicios externos
   - Cliente Directus configurado
   - Utilidades de infraestructura (crypto, prisma)

3. **Data Layer** (`src/lib/data/`)
   - Transformación y acceso a datos
   - Helpers para obtener datos de páginas

4. **Presentation Layer** (`src/lib/components/`)
   - Componentes Svelte organizados por propósito
   - Separación entre componentes Directus, site-specific, y UI base

### Tipado de Directus

**Patrón importante**:
- El submódulo `$cms` proporciona los tipos base de las colecciones
- El Schema local (`src/lib/infrastructure/directus/schema.d.ts`) mapea nombres de colecciones a tipos inferidos de queries
- Los tipos de requests se infieren automáticamente de las queries usando `QueryItem<Schema, T>`
- Se usan esquemas Zod para validación en runtime de los datos recibidos
- **NO** se usan directamente los tipos completos de colecciones del submódulo, solo como referencia base

Ejemplo:
```typescript
// Query con tipos inferidos
const getHotelQuery = (filters: DirectusRequestBody): QueryItem<Schema, 'stopover_hotels'> => ({
  fields: ['main_image', 'promo_code', ...], // Solo campos necesarios
  filter: { ... }
});

// El tipo de retorno se infiere automáticamente
const hotel = await getItems('stopover_hotels', getHotelQuery(filters), preview);
// hotel tiene tipo inferido basado en los fields especificados
```

## Tailwind CSS 4

### Configuración

1. **Presets base**: Importados desde `design-sytem-svelte-components/tailwind-presets/v4/theme.css`
2. **Extensiones del proyecto**: En `src/app.css` usando `@theme { ... }`
3. **Componentes base**: Usan la configuración del preset padre
4. **Utilidades**: 
   - `cn()` para merge de clases (en `src/lib/core/utils/index.ts`)
   - `tv()` para variantes con tailwind-variants

### Estructura de estilos

```css
/* src/app.css */
@import 'tailwindcss';
@import '../design-sytem-svelte-components/tailwind-presets/v4/theme.css';

@theme {
  /* Extensiones específicas del proyecto */
  --color-stopover-accent: oklch(...);
  --color-stopover-canal: oklch(...);
  /* ... */
}

@layer components {
  /* Componentes personalizados */
}
```

## Build y Deployment

- **Adapter**: `@sveltejs/adapter-static` (para Cloudflare Pages)
- **Build Command**: `pnpm build`
- **Output**: `build/` (HTML estático)
- **Environment**: Variables de entorno requeridas para Directus

## Testing

- **Integration Tests**: Playwright (`playwright.config.ts`)
- **Unit Tests**: Vitest (`vitest.config.ts` o en `vite.config.ts`)
- **Test Files**: `*.test.ts` o `*.spec.ts` en `src/`

## Configuraciones Clave

### TypeScript (`tsconfig.json`)
- `strict: true` - Modo estricto habilitado
- Path aliases configurados
- Extiende `.svelte-kit/tsconfig.json`

### SvelteKit (`svelte.config.js`)
- Adapter: `@sveltejs/adapter-static` (comentado, usar para producción)
- Preprocessor: `vitePreprocess`

### Vite (`vite.config.ts`)
- Plugin: `@tailwindcss/vite`
- Plugin: `@sveltejs/kit/vite`
- Path aliases configurados
- Server configurado para permitir acceso a submódulos

### PostCSS (`postcss.config.js`)
- Plugin: `@tailwindcss/postcss`

## Convenciones de Código

1. **TypeScript**: Tipado estricto, evitar `any`
2. **Svelte**: Componentes en PascalCase, archivos `.svelte`
3. **Imports**: Usar path aliases (`$lib`, `$cms`, `$ui`)
4. **Validación**: Usar Zod para validar datos de Directus
5. **Funcional**: Usar Ramda para programación funcional
6. **Estilos**: Tailwind CSS con utilidades, evitar CSS inline cuando sea posible

## Reglas Importantes

1. **Submódulos**: 
   - NO editar código dentro de submódulos
   - Solo se puede actualizar la referencia en `.gitmodules`
   - Los submódulos son dependencias de solo lectura

2. **Directus Types**:
   - Usar tipos base del submódulo `$cms` solo como referencia
   - Los tipos de requests se infieren de las queries
   - Crear esquemas Zod que coincidan con los campos solicitados en queries

3. **Componentes**:
   - Componentes base desde `$ui` (submódulo)
   - Componentes específicos del sitio en `src/lib/components/site/`
   - Componentes Directus en `src/lib/components/directus/`

4. **Arquitectura**:
   - Mantener separación de capas (domain, infrastructure, data, presentation)
   - Lógica de negocio en `domain/`
   - Integraciones externas en `infrastructure/`
