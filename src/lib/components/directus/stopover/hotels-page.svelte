<script lang="ts">
	import type { HotelSchema } from '$lib/directus/hotels';
	import { getTypography } from '$lib/components/ui/foundations/typography';
	import { Hero } from '$lib/components/site/items';
	import { page } from '$app/stores';
	import { StopoverPromoCard } from '$lib/components/site/items/cards';
	import { MainCallToAction } from '$lib/components/site/items/call-to-actions';
	import { Map } from '$lib/components/site/items/maps';

	export let stopover_hotels: HotelSchema;

	const {
		main_image,
		phone_number,
		booking_email,
		supported_languages,
		includes,
		stars,
		location,
		gallery,
		translations
	} = stopover_hotels;

	const currrentTranslation = translations.filter((t) => t.lang_code === $page.data.locale);

	const {
		0: { name, description, promo_name, promo_description, url }
	} = currrentTranslation;

	const item = stopover_hotels;
</script>

<Hero {main_image} {name}></Hero>
<div class="container mx-auto h-20 bg-backgound-lightblue py-2">Galeria</div>
<div class="container mx-auto my-8 space-y-8">
	<p class={getTypography('body-large', 'body')}>
		{description}
	</p>
	{#if promo_name && promo_description}
		<StopoverPromoCard {item}></StopoverPromoCard>
	{/if}
	<MainCallToAction {item}></MainCallToAction>

	<Map {item}></Map>
</div>
