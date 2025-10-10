<!-- +page.svelte -->

<!--
  CONTEXTO:
  - Esta página recibe desde +page.server.ts:
    - data.ok, data.status, data.token, data.reservation, data.traveler
    - data.cms: objeto con bloques de texto del CMS (opcional)
  - Integra tus claves reales del CMS donde dice CMS:...
-->

<script>
  export let data;

  // Ejemplo de shape esperado (no hay fetch aquí):
  // data.cms = {
  //   heroTitle: string,
  //   heroSubtitle: string,
  //   instructions: string,         // texto corto de ayuda
  //   legalNotice: string,          // aviso legal / consentimiento
  //   contactBlock: string          // contacto/soporte
  // }
</script>

<!-- ======= HERO / CABECERA (CMS) ======= -->
<section class="container mx-auto px-4 py-8">
  <!-- CMS: Título principal -->
  <h1 class="text-2xl md:text-3xl font-semibold">
    {data.cms?.heroTitle /* CMS: colocar título aquí */}
  </h1>

  <!-- CMS: Subtítulo / Bajada -->
  {#if data.cms?.heroSubtitle}
    <p class="mt-2 text-sm md:text-base text-neutral-600">
      {data.cms.heroSubtitle /* CMS: subtítulo */}
    </p>
  {/if}
</section>

<!-- ======= ESTADO DE VERIFICACIÓN ======= -->
<section class="container mx-auto px-4">
  {#if !data.ok}
    <!-- Estados de error -->
    {#if data.error === 'missing_id'}
      <div class="rounded-xl p-4 bg-yellow-50 border border-yellow-200">
        <!-- CMS: mensaje “Falta ID” -->
        <p>Falta el identificador del token en la URL.</p>
      </div>
    {:else if data.error === 'revoked'}
      <div class="rounded-xl p-4 bg-red-50 border border-red-200">
        <!-- CMS: mensaje “Token revocado” -->
        <p>Este acceso ha sido revocado.</p>
      </div>
    {:else if data.error === 'expired'}
      <div class="rounded-xl p-4 bg-orange-50 border border-orange-200">
        <!-- CMS: mensaje “Token expirado” -->
        <p>El token ha expirado.</p>
      </div>
    {:else}
      <div class="rounded-xl p-4 bg-gray-50 border border-gray-200">
        <!-- CMS: mensaje “No encontrado / genérico” -->
        <p>No se encontró información para este código.</p>
      </div>
    {/if}
  {:else}
    <!-- Caso OK -->
    <div class="rounded-2xl border p-4 md:p-6 bg-white shadow-sm">
      <!-- BLOQUE: Identidad mostrada (solo inicial + apellidos) -->
      <div class="mb-4">
        <h2 class="text-lg font-medium">
          <!-- CMS: label “Reserva / Pasajero” -->
          {#if data.traveler}
            {data.traveler.displayTraveler /* “J. Pérez Gómez” */}
          {:else}
            {data.reservation.reservationLastNames /* “Pérez Gómez, Rodríguez” */}
          {/if}
        </h2>
        <p class="text-sm text-neutral-600">
          <!-- CMS: texto auxiliar -->
          <!-- p. ej. “Datos visibles solo para validar el Stopover” -->
        </p>
      </div>

      <!-- BLOQUE: Fechas y fase -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-3">
        <div class="rounded-xl bg-neutral-50 p-3">
          <div class="text-xs text-neutral-500">Llegada a PTY</div>
          <div class="text-base font-medium">{data.reservation.arrivalPtyAt}</div>
        </div>
        <div class="rounded-xl bg-neutral-50 p-3">
          <div class="text-xs text-neutral-500">Salida de PTY</div>
          <div class="text-base font-medium">{data.reservation.departurePtyAt}</div>
        </div>
        <div class="rounded-xl bg-neutral-50 p-3">
          <div class="text-xs text-neutral-500">Estado</div>
          <div class="text-base font-medium capitalize">{data.reservation.phase.replace('_',' ')}</div>
        </div>
      </div>

      <!-- BLOQUE: Instrucciones (CMS) -->
      {#if data.cms?.instructions}
        <div class="mt-6 prose prose-sm max-w-none">
          {@html data.cms.instructions /* CMS: contenido HTML seguro/sanitizado */}
        </div>
      {/if}
    </div>
  {/else}
</section>

<!-- ======= BLOQUE LEGAL (CMS) ======= -->
{#if data.cms?.legalNotice}
  <section class="container mx-auto px-4 mt-6">
    <div class="rounded-xl bg-neutral-50 border p-4">
      <div class="text-xs text-neutral-500 mb-1">Aviso</div>
      <div class="prose prose-sm max-w-none">
        {@html data.cms.legalNotice /* CMS: HTML del aviso/consentimiento */}
      </div>
    </div>
  </section>
{/if}

<!-- ======= CONTACTO / AYUDA (CMS) ======= -->
{#if data.cms?.contactBlock}
  <section class="container mx-auto px-4 mt-6 mb-10">
    <div class="rounded-xl bg-white border p-4">
      <div class="prose prose-sm max-w-none">
        {@html data.cms.contactBlock /* CMS: HTML de contacto/ayuda */}
      </div>
    </div>
  </section>
{/if}

<style>
  /* Estilos mínimos; ajusta según tu diseño/tokens */
  .container { max-width: 768px; }
</style>
