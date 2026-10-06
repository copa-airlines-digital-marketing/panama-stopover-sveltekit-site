<script lang="ts">
	import Section from '$lib/components/directus/sites/section.svelte';
	import VamosEvents from '$lib/components/site/events/vamos-events.svelte';
	import HeroBlock from '$lib/components/site/hero/hero-block.svelte';
	import { eventsHero } from './hero';
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
	<main id="eventos">
		<HeroBlock item={eventsHero} />
		<section id="agenda" aria-labelledby="agenda-title" class="container py-16 md:py-24">
			<h2 id="agenda-title" class="font-heading text-u4 font-semibold text-primary">
				Agenda de eventos
			</h2>
			<p class="mt-4 mb-8 max-w-3xl text-b">
				Consulta las actividades disponibles para las fechas de tu visita.
			</p>
			<VamosEvents />
		</section>
	</main>
	{#if data.layoutSections[1]}
		<Section section={data.layoutSections[1]} />
	{/if}
</div>
