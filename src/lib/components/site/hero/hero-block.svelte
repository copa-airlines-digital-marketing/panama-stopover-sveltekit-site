<script lang="ts">
	import type { HeroBlock } from '$lib/directus/hero';
	import HeroSlide from './hero-slide.svelte';
	import HeroEditorial from './hero-editorial.svelte';
	import HeroPillar from './hero-pillar.svelte';
	import HeroCarousel from './hero-carousel.svelte';
	import { Breadcrum } from '$lib/components/site/navigation/breadcrum';
	import { page } from '$app/stores';
	import { resolvePageAccent } from '$lib/domain/pages/accent';
	export let item: HeroBlock;
	$: accent = resolvePageAccent($page.data.page?.accent, $page.data.siteSettings?.colors);
</script>

{#if item.slides.length === 1 && item.variant === 'hero-c'}
	<HeroPillar {item} {accent} />
{:else if item.slides.length === 1 && item.variant === 'hero-b'}
	<HeroEditorial {item} {accent} />
{:else if item.slides.length === 1}
	<HeroSlide item={item.slides[0]} heading={item.heading} eager={item.heading === 'h1'} />
{:else if item.slides.length > 1}
	{#key `${item.id}:${item.slides.map((slide) => slide.id).join(',')}`}
		<HeroCarousel {item} />
	{/key}
{/if}
{#if item.variant === 'hero-a' && item.slides.length && item.heading === 'h1' && $page.data.page}
	<div class="container mx-auto"><Breadcrum item={$page.data.page} /></div>
{/if}
