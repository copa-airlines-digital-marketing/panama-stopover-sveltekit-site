# Hero y carrusel

## Estado

Directus contiene 16 heroes publicados y seleccionados en sus páginas: cuatro A, seis B y seis C. Términos y condiciones usa la presentación `article` de `Text_Content` 124, con sus tres traducciones originales. Los registros anteriores se conservan para recuperación y otros usos.

El sitio es estático. El siguiente despliegue debe incluir este consumidor compatible con las referencias del CMS. La integración en `dev` no dispara los workflows manuales de despliegue.

El carrusel de demostración de Naturaleza y Shopping, sus dos heroes, seis traducciones y dos relaciones se eliminaron de Directus el 2026-09-21 por solicitud del usuario. Se comprobó que no tenían referencias de páginas ni de otros carruseles. Las imágenes existentes del sitio siguen disponibles. Los fixtures de pruebas viven bajo `scripts/` y no son páginas publicables.

## Contenido y presentación

`block_hero` y `block_hero_carousel` reutilizan los mismos heroes mediante relaciones ordenadas. El estado pertenece al hero. Publicar requiere al menos una traducción completa; el frontend selecciona el idioma de la ruta y omite el contenido si no existe esa traducción.

Un solo slide aparece como hero individual sin controles. Varios slides usan Embla con controles horizontales: anterior, siguiente, contador y play/pausa con anillo. Empiezan pausados y avanzan cada seis segundos al reproducir. Hover suspende el reloj; foco, navegación manual y pestaña oculta lo pausan. El componente libera temporizadores al desmontarse. La duración física de Embla es 40; no son milisegundos. Movimiento reducido usa cambios inmediatos y omite el anillo.

En desktop, desde 960 px, la caja de texto del carrusel y los controles comparten su borde inferior. A individual conserva su composición y tipografía anteriores. B utiliza `hero-editorial.svelte`; C utiliza `hero-pillar.svelte`.

Los sellos monocromáticos se muestran negros sobre círculo blanco sólido, con espacio interior y sombra. El SVG se carga como imagen; no se inserta como HTML activo. El componente aplica un ajuste óptico de 1.5 % a la derecha y 2.5 % hacia abajo, revisado con el sello español. Un asset diferente requiere revisión visual.

## Acento de página

B y C reciben `pages.accent`, resuelto contra `sites.colors`. Se guarda la clave de la paleta, sin controles de color en el hero. Solo se aceptan hexadecimales de tres o seis dígitos; un acento vacío o desconocido usa `primary`. A y carrusel conservan su presentación.

- Gastronomía, Shopping y Restaurantes: `gastro-shoping`, `#FF8400`.
- Hoteles: `light-blue`, `#00A3E0`.
- Naturaleza y Playas: `nature`, `#4A9A00`.
- Cultura: `history-culture`, `#FF0019`.
- Canal: `panama-canal`, `#282DFF`.

El selector está en Settings de la página. Añadir, retirar o renombrar claves requiere sincronizar sus opciones con el script `apply-page-accent.mjs --sync-options --apply` del proyecto documental. Los Flows validan siempre contra la paleta vigente. No se depende del fondo de la sección antigua.

## Código

- `src/lib/directus/hero.ts`: contrato normalizado y campos solicitados.
- `src/lib/server/hero.ts`: selección de idioma, validación, saneamiento y adaptación.
- `src/lib/server/hero-repository.ts`: carga de referencias separada de la consulta general.
- `src/lib/server/article.ts`: saneamiento del artículo legal.
- `src/lib/components/site/hero/`: heroes, carrusel, sello y reloj de reproducción.
- `src/lib/domain/pages/accent.ts`: resolución del acento validado.

Los módulos de migración bajo `scripts/migrations/` conservan alcance fijo y detección de cambios concurrentes. Los planes, wrappers y journals están en el proyecto documental Panama Stopover Hero Carousel. No repetir el staging como si las copias siguieran en borrador.

## Revisión local

El preview de borradores solo funciona en desarrollo y loopback. Lee `.env.agent` exclusivamente en servidor, no genera entradas de producción y envía no-store/noindex. No incluir credenciales en artefactos. El servidor requiere autorización explícita; una vez autorizado: `pnpm exec vite dev --host 127.0.0.1 --port 1615`.

El HTML offline se genera con `node scripts/build-hero-offline.mjs <assets.json>` y se comprueba con `node scripts/verify-hero-offline.mjs`. Requiere los assets locales del prototipo aprobado. Los resultados se sobrescriben en `artifacts/hero-controls`, excluido de Git. Ese HTML no se publica como parte del sitio.

La revisión del 2026-09-18 cubrió 0/1/2/5/10 slides, idiomas es/en/pt, texto largo, teclado, foco, hover, reproducción y movimiento reducido. La migración se revisó en 51 rutas y la compilación generó 681 rutas. El 2026-09-21 se verificaron los colores de Restaurantes y Hoteles a 1440 y 390 px.

## Comprobaciones de integración

El 2026-09-21 Svelte check terminó con cero errores y advertencias de diagnóstico. Vitest dio 69 pruebas aprobadas y dos fallos en `src/lib/directus/tours/tours.test.ts`: esperan listas aunque la función existente en `origin/dev` devuelve un registro o null. El código y esas pruebas no se modificaron en esta integración.

La auditoría de dependencias consultada el 2026-09-21 reportó 19 avisos altos, 11 moderados y tres bajos, sin críticos. Es un resultado actualizado; reemplaza el recuento histórico de cuatro altos y uno moderado. Requiere tratamiento antes de liberar; no se ejecutó ningún despliegue ni se declara aprobación de seguridad.

## Referencia visual

Se reutilizan las composiciones de producción y el patrón de controles aprobado. Fuente: Copa Digital Design System, https://copa-digital-design-system.pages.dev/prompt.md, versión 2026-08-26, verificada por el prototipo el 2026-09-15 y consultada nuevamente durante los ajustes del 2026-09-18. Las comprobaciones visuales no equivalen a investigación con viajeros ni certifican el contraste de todas las combinaciones de paleta.

El lint de los archivos de integración detectó 14 avisos en tres archivos existentes. Ejecutar el mismo análisis sobre sus versiones de origin/dev reprodujo exactamente el recuento y las reglas: seis usos de any y ocho imports sin uso. No se modificó esa deuda en esta integración. Los datos generados de rutas bajo static/data se excluyeron del commit porque no corresponden al hero.

La compilación de integración del 2026-09-21 terminó correctamente con 681 rutas. Se revisaron 1393 archivos estáticos sin credenciales configuradas, contenido de la demostración eliminada ni páginas de preview. Se comprobaron los acentos de Hoteles y Restaurantes en los HTML finales. La concurrencia temporal de cuatro rutas se restauró a la configuración habitual antes del commit.
