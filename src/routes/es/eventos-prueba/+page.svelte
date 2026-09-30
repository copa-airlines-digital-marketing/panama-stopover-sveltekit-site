<script lang="ts">
	import Section from '$lib/components/directus/sites/section.svelte';
	import VamosEvents from '$lib/components/site/events/vamos-events.svelte';
	import type { PageData } from './$types';

	export let data: PageData;
</script>

<svelte:head>
	<title>Eventos en Panamá | Panamá Stopover</title>
	<meta name="robots" content="noindex,nofollow" />
	<meta
		name="description"
		content="Conciertos, cultura y actividades en Panamá durante tu Stopover."
	/>
</svelte:head>

<div class="min-h-svh bg-background-paper font-body text-grey-800">
	{#if data.layoutSections[0]}
		<Section section={data.layoutSections[0]} />
	{/if}
	<main id="eventos" class="container pt-16 pb-16 md:pt-24">
		<p class="mb-2 text-d1 text-grey-600">Página de prueba</p>
		<h1 class="font-heading text-u4 font-semibold text-primary">Eventos en Panamá</h1>
		<p class="mt-4 mb-8 max-w-3xl text-b">
			Descubre conciertos, cultura y actividades para disfrutar durante tu Stopover.
		</p>
		<VamosEvents />
	</main>
	{#if data.layoutSections[1]}
		<Section section={data.layoutSections[1]} />
	{/if}
</div>
