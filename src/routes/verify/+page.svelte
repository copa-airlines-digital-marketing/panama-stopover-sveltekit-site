<script>
  export let data;
</script>

<!-- ======= HERO / CABECERA ======= -->
<section class="container mx-auto px-4 py-8">
  <h1 class="text-2xl md:text-3xl font-semibold">
    Verificación de Stopover
  </h1>

  <p class="mt-2 text-sm md:text-base text-neutral-600">
    Validación de acceso a beneficios de Panama Stopover
  </p>
</section>

<!-- ======= ESTADO DE VERIFICACIÓN ======= -->
<section class="container mx-auto px-4">
  {#if !data.ok}
    <!-- Estados de error -->
    {#if data.error === 'missing_id'}
      <div class="rounded-xl p-4 bg-yellow-50 border border-yellow-200">
        <p>Falta el identificador del token en la URL.</p>
      </div>
    {:else if data.error === 'revoked'}
      <div class="rounded-xl p-4 bg-red-50 border border-red-200">
        <p>Este acceso ha sido revocado.</p>
      </div>
    {:else if data.error === 'expired'}
      <div class="rounded-xl p-4 bg-orange-50 border border-orange-200">
        <p>El token ha expirado.</p>
      </div>
    {:else}
      <div class="rounded-xl p-4 bg-gray-50 border border-gray-200">
        <p>No se encontró información para este código.</p>
      </div>
    {/if}
  {:else}
    <!-- Caso OK -->
    <div class="rounded-2xl border p-4 md:p-6 bg-white shadow-sm">
      <!-- BLOQUE: Identidad mostrada -->
      <div class="mb-4">
        <h2 class="text-lg font-medium">
          {#if data.traveler}
            {data.traveler.displayTraveler}
          {:else}
            {data.reservation.reservationLastNames}
          {/if}
        </h2>
        <p class="text-sm text-neutral-600">
          Datos visibles solo para validar el Stopover
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
    </div>
  {/if}
</section>

<style>
  .container { max-width: 768px; }
</style>
