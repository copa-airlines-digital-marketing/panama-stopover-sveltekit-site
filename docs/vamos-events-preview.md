# Prueba de eventos de Vamos

Ruta: `/es/eventos-prueba/`.

La página se genera con el adaptador estático del sitio y reutiliza la cabecera, el pie, la tipografía y los componentes existentes. No modifica Directus ni añade un enlace al menú. El Web Component se carga en el navegador únicamente si el origen es exactamente `https://dev.panama-stopover.com`.

## Datos y acceso

El hero de esta ruta reutiliza `HeroBlock` y el carrusel Embla existente, con dos slides definidos en `src/routes/es/eventos-prueba/hero.ts`. Es contenido local de presentación, sin registros de prueba en Directus ni anuncios de eventos con fechas inventadas. Usa dos fotografías existentes y el sello español. El primer botón lleva a `#agenda`; el segundo, a `/es/conoce-panama/`. El carrusel conserva play/pausa, contador, navegación y movimiento reducido. El primer slide aporta el único h1; la agenda usa h2.

- Script: `https://www.vamoseventos.com/embed/vamos-copa-events.js`.
- Configuración observada en la demo del proveedor el 30 de septiembre de 2026: `city="ciudad de panamá"`, `lang="es"`, `view="monthly"`, `layout="row"`, `limit="12"`.
- La guía de Vamos declara una clave de Copa preconfigurada. Este cambio no copia credenciales ni añade una API intermedia.
- El correo de Jaime del 26 de agosto autoriza `panama-stopover.com` y `dev.panama-stopover.com`. Esta prueba se limita al segundo.
- El wrapper espera hasta 15 segundos por el registro del componente, permite reintentar ante fallo del script y conserva el mensaje del proveedor ante errores de API o agenda vacía. El registro del componente no se presenta como confirmación de datos en vivo.
- No incluye eventos de ejemplo, snapshot ni lectura de la estructura interna de las tarjetas. Vamos controla la consulta, los meses, la paginación y las acciones de cada evento.

## Publicación y comprobación

1. Generar el sitio con las variables habituales de Directus y publicar esta rama mediante el proceso del ambiente de desarrollo que sirve `dev.panama-stopover.com`. No desplegar a producción.
2. Abrir `https://dev.panama-stopover.com/es/eventos-prueba/`. Un hostname alternativo de CDN, localhost o un archivo local no valida la autorización del proveedor.
3. Comprobar en la red del navegador que el script devuelve JavaScript y que la solicitud de eventos responde correctamente. No copiar la clave de las solicitudes en capturas ni registros compartidos.
4. Comprobar eventos actuales, navegación mensual, paginación y destinos de los enlaces. Verificar móvil y teclado. Si Vamos muestra "Eventos no disponibles", la prueba aún no demuestra datos en vivo.
5. Si falla, distinguir bloqueo del script/CSP, autorización de origen o credencial, respuesta vacía y error del proveedor antes de reportar el resultado. No desactivar controles ni simular el origen.

La documentación antigua menciona `www.vamoseventos.com` en `script-src` y `kohxjulvxrlyyxqbtlxi.supabase.co` en `connect-src`. Confirmar los endpoints actuales en la prueba antes de ajustar CSP; este cambio no modifica las políticas globales.

El workflow de desarrollo del repositorio anuncia un dominio `monks.zone`, que no coincide con la lista autorizada. Se debe comprobar qué pipeline sirve el dominio de Copa antes de desplegar. La rama por sí sola no publica esta página.

La página lleva `noindex,nofollow` y no se enlaza desde el menú. Eso no es control de acceso. Si se incorpora a otra rama, la ruta estática seguirá existiendo, pero el componente no se cargará fuera del origen de desarrollo.

## Referencia visual

La composición de la ruta reproduce la cuadrícula de `directus/procesor.svelte`: cabecera y `main` comienzan en la primera fila, la cabecera tiene `z-50` y el pie ocupa la tercera fila. Esto permite que la fotografía llegue hasta el borde superior y que el menú flote sobre ella. La revisión debe incluir las secciones reales de cabecera y pie, no solo el carrusel aislado.

La revisión de este ajuste del 6 de octubre se hizo sobre el prerender completo con cabecera y pie CMS reales, a 1440, 1366, 768 y 390 px. La foto comienza en y=0, la cabecera queda sobre la imagen y recibe clics, los controles caben en la foto y el pie aparece después de la agenda. Las flechas funcionan y no hay desbordamiento horizontal ni errores JavaScript. El navegador leyó los archivos generados mediante interceptación local, sin servidor ni simulación del dominio autorizado de Vamos.

Fuente: `https://copa-digital-design-system.pages.dev/prompt.md`. Se reutilizan los componentes y tokens instalados en el repositorio y la referencia del prototipo validada contra el sistema del 11 de agosto de 2026. El 30 de septiembre la fuente vigente no estuvo accesible; no se afirma una nueva validación visual. No se crean tokens ni se modifica el submódulo de diseño.

## Validación local

El 6 de octubre de 2026 se añadió el carrusel a esta ruta. Las 15 pruebas de reproducción y cargador Vamos pasaron; lint y formato de los archivos modificados pasaron; Svelte check reportó cero errores y advertencias. La página compilada se revisó por archivo local a 1440 y 390 px: dos imágenes distintas, sello visible, un h1, controles dentro de la foto, navegación, play/pausa y enlace a la agenda correctos, sin desbordamiento horizontal, errores JavaScript ni conexiones. Esa revisión omite únicamente cabecera y pie CMS e incrusta assets; no simula el origen autorizado ni prueba eventos en vivo. No se ejecutó un build completo del catálogo ni un despliegue para este ajuste.

Ejecutar `pnpm exec vitest run src/lib/events/vamos-loader.test.ts`, `pnpm check` y el build habitual del sitio. Estas comprobaciones no requieren servidor local. La disponibilidad real de los eventos se valida después de publicar en el dominio autorizado.

Comprobación del 30 de septiembre de 2026:

- Ocho pruebas del cargador aprobadas; lint y formato de los archivos añadidos aprobados.
- `pnpm check`: cero errores y cero advertencias de Svelte. Conserva mensajes de configuración de submódulos que ya aparecían antes del cambio.
- Vite compiló cliente y servidor y generó `.svelte-kit/output/prerendered/pages/es/eventos-prueba/index.html`. Se comprobaron título, `noindex`, estado de carga, mensaje sin JavaScript y enlace alternativo. El script externo no se ejecuta durante SSR.
- El build global no se completó: el generador de entradas de Directus continuó procesando el catálogo de 678 rutas incluso con una selección acotada de prerender. Se detuvo después de generar la página de prueba y se restauró la configuración original. No desplegar la salida parcial; generar el sitio completo mediante el pipeline normal.
- No se inició servidor local ni se verificó visualmente la página en navegador. La carga de datos en vivo queda pendiente del despliegue autorizado.
