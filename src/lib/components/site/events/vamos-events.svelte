<script lang="ts">
	import { onMount } from 'svelte';
	import { Button } from '$ui/components/button';
	import { isVamosPreviewOrigin, loadVamosComponent } from '$lib/events/vamos-loader';

	let state: 'loading' | 'ready' | 'failed' | 'unsupported' = 'loading';
	let mounted = false;

	async function load() {
		state = 'loading';
		try {
			await loadVamosComponent();
			if (mounted) state = 'ready';
		} catch {
			if (mounted) state = 'failed';
		}
	}

	onMount(() => {
		mounted = true;
		if (isVamosPreviewOrigin(window.location.origin)) {
			void load();
		} else {
			state = 'unsupported';
		}
		return () => {
			mounted = false;
		};
	});
</script>

<div class="font-body" aria-busy={state === 'loading'}>
	{#if state === 'ready'}
		<!-- Keep vendor rendering intact. Registration does not confirm live data. -->
		<vamos-copa-events
			city="ciudad de panamá"
			lang="es"
			view="monthly"
			layout="row"
			limit="12"
			class="block"
		></vamos-copa-events>
	{:else}
		<div class="rounded-3xl bg-background-lightblue p-6">
			<p role="status" aria-live="polite">
				{#if state === 'loading'}
					Cargando la agenda de eventos…
				{:else if state === 'unsupported'}
					Esta agenda de prueba está disponible en el sitio de desarrollo de Panamá Stopover.
				{:else}
					No pudimos cargar la agenda de eventos. Intenta nuevamente.
				{/if}
			</p>
			{#if state === 'failed'}
				<Button class="mt-4" onclick={() => void load()}>Reintentar</Button>
			{/if}
		</div>
	{/if}
	<noscript><p>Activa JavaScript para consultar la agenda de eventos.</p></noscript>
	<div class="mt-6 flex flex-wrap items-center gap-4">
		<p class="text-d1 text-grey-600">Agenda proporcionada por Vamos Eventos.</p>
		<Button
			href="https://www.vamoseventos.com/partners/copa-airlines/destination"
			target="_blank"
			rel="noopener noreferrer"
			variant="outline-primary-main">Consultar en Vamos (nueva pestaña)</Button
		>
	</div>
</div>
