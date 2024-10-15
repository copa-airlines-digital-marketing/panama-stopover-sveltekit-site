<script lang="ts">
	import type { RestaurantSchema } from '$lib/directus/restaurants';
	import { page } from '$app/stores';
	import { getDirectusImage } from './utils';
	import { Hero } from '$lib/components/site/items';
	import { Breadcrum } from '$lib/components/site/navigation/breadcrum';
	import { getTypography } from '$lib/components/ui/foundations/typography';
	import { StopoverPromoCard } from '$lib/components/site/items/cards';
	import { MainCallToAction } from '$lib/components/site/items/call-to-actions';
	import { SpokenLanguages } from '$lib/components/site/items/languages';
	import { Map } from '$lib/components/site/items/maps';

	export let stopover_restaurants: RestaurantSchema;

	const { main_image, translations } = stopover_restaurants;

	const currrentTranslation = translations.filter((t) => t.lang_code === $page.data.locale);

	const {
		0: { description, promo_name, promo_description }
	} = currrentTranslation;

	const item = stopover_restaurants;
</script>

<svelte:head>
	<title>{currrentTranslation[0].name}</title>
	<meta name="description" content={currrentTranslation[0].description} />
	<meta property="og:title" content={currrentTranslation[0].name} />
	<meta property="og:type" content="article" />
	<meta property="og:url" content={$page.url.href} />
	<meta property="og:image" content={getDirectusImage(main_image)} />
	<meta name="twitter:card" content="summary_large_image" />
</svelte:head>

<Hero {item} class="bg-stopover-gastronomy" />
<div class="container mx-auto my-8 space-y-normal">
	<div>
		<Breadcrum {item} />
		<p class={getTypography('body-large', 'body', 'mb-petit')}>
			{description}
		</p>
		{#if promo_name && promo_description}
			<StopoverPromoCard {item}></StopoverPromoCard>
		{/if}
		<div class="md:flex md:justify-center">
			<MainCallToAction {item} class="mt-petit"></MainCallToAction>
		</div>
	</div>
	<div class="space-y-8">
		<SpokenLanguages {item}></SpokenLanguages>
	</div>
	<Map {item}></Map>
</div>