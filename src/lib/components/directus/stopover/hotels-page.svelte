<script lang="ts">
	import type { HotelSchema } from '$lib/directus/hotels';
	import { getTypography, getTypographyVariant } from '$lib/components/ui/foundations/typography';
	import { Hero } from '$lib/components/site/items';
	import { page } from '$app/stores';
	import { StopoverPromoCard } from '$lib/components/site/items/cards';
	import { MainCallToAction } from '$lib/components/site/items/call-to-actions';
	import { Map } from '$lib/components/site/items/maps';
	import { HotelCTAs } from '$lib/components/site/items/iconned-cta';
	import { SVG } from '$lib/components/ui/foundations/icon';
	import { ItemIncludes } from '$lib/components/site/items/includes';
	import type { HotelAmenity } from '$lib/directus/hotel-amenities';
	import { SpokenLanguages } from '$lib/components/site/items/languages';
	import { Breadcrum } from '$lib/components/site/navigation/breadcrum';
	import { getDirectusImage } from './utils';

	export let stopover_hotels: { hotel: HotelSchema; amenities: HotelAmenity[] };

	const { main_image, stars, translations } = stopover_hotels.hotel;

	const currrentTranslation = translations.filter((t) => t.lang_code === $page.data.locale);

	const {
		0: { description, promo_name, promo_description }
	} = currrentTranslation;

	const item = stopover_hotels.hotel;

	const labels = $page.data.siteSettings.translations?.[0]?.labels;

	const starsLabel = labels?.filter((label) => label.name === 'hotel-stars')[0];

	const hotelIncludesLabel = labels?.filter((label) => label.name === 'hotel-includes')[0];

	const icons = $page.data.siteSettings.ui_icons?.map((icon) => icon.icons_id);

	const starIcon = icons?.filter((icon) => icon.name === 'star')[0];
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

<Hero {item} class="bg-secondary" />
<div class="container mx-auto my-8 space-y-huge">
	<div>
		<Breadcrum {item} />
		<p class={getTypography('body', 'body', 'flex items-center text-grey-600')}>
			{#if starIcon}
				<SVG data={starIcon?.code} class="size-8 fill-current"></SVG>
			{:else}
				{'Please add a "star" icon to the site'}
			{/if}
			<span>
				{`${stars} ${starsLabel ? starsLabel.value : 'Please add hotels-stars label to site'}`}
			</span>
		</p>
		<p class={getTypography('body-large', 'body', 'mb-petit')}>
			{description}
		</p>
		{#if promo_name && promo_description}
			<StopoverPromoCard {item}></StopoverPromoCard>
		{/if}
		<MainCallToAction {item} class="mt-petit"></MainCallToAction>
	</div>
	<div class="space-y-4">
		<h2 class={getTypographyVariant('h2')}>
			{#if hotelIncludesLabel}
				{hotelIncludesLabel.value}
			{:else}
				{'Plase include a hotel-includes label to the site'}
			{/if}
		</h2>
		<ItemIncludes {item} amenites={stopover_hotels.amenities}></ItemIncludes>
	</div>
	<SpokenLanguages {item}></SpokenLanguages>
	<Map {item}></Map>
	<HotelCTAs {item}></HotelCTAs>
</div>
