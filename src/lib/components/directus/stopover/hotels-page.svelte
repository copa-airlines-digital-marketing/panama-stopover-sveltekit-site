<script lang="ts">
	import type { HotelSchema } from '$lib/directus/hotels';
	import { getTypography } from '$lib/components/ui/foundations/typography';
	import { Hero } from '$lib/components/site/items';
	import { page } from '$app/stores';
	import { StopoverPromoCard } from '$lib/components/site/items/cards';
	import { MainCallToAction } from '$lib/components/site/items/call-to-actions';
	import { Map } from '$lib/components/site/items/maps';
	import { HotelCTAs } from '$lib/components/site/items/iconned-cta';
	import { SVG } from '$lib/components/ui/foundations/icon';

	export let stopover_hotels: HotelSchema;

	const { supported_languages, includes, stars, translations } = stopover_hotels;

	const currrentTranslation = translations.filter((t) => t.lang_code === $page.data.locale);

	const {
		0: { description, promo_name, promo_description }
	} = currrentTranslation;

	const item = stopover_hotels;

	const labels = $page.data.siteSettings.translations?.[0]?.labels;

	const starsLabel = labels?.filter((label) => label.name === 'hotel-stars')[0];

	const icons = $page.data.siteSettings.ui_icons?.map((icon) => icon.icons_id);

	const starIcon = icons?.filter((icon) => icon.name === 'star')[0];
</script>

<Hero {item}>
	<span class={getTypography('body', 'body', 'flex items-center text-grey-100')}>
		{#if starIcon}
			<SVG data={starIcon?.code} class="size-8 fill-current"></SVG>
		{:else}
			{'Please add a "star" icon to the site'}
		{/if}
		<span>
			{`${stars} ${starsLabel ? starsLabel.value : 'Please add hotels-stars label to site'}`}
		</span>
	</span>
</Hero>
<div class="container mx-auto my-8 space-y-huge">
	<div class="space-y-petit">
		<p class={getTypography('body-large', 'body')}>
			{description}
		</p>
		{#if promo_name && promo_description}
			<StopoverPromoCard {item}></StopoverPromoCard>
		{/if}
		<MainCallToAction {item}></MainCallToAction>
	</div>
	<Map {item}></Map>
	<HotelCTAs {item}></HotelCTAs>
</div>
