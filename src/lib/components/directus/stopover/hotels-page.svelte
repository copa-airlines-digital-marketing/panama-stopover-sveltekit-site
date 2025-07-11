<script lang="ts">
	import type { HotelSchema } from '$lib/directus/hotels';
	import { Hero } from '$lib/components/site/items';
	import { page } from '$app/stores';
	import { StopoverPromoCard } from '$lib/components/site/items/cards';
	import { MainCallToAction } from '$lib/components/site/items/call-to-actions';
	import { Map } from '$lib/components/site/items/maps';
	import { HotelCTAs } from '$lib/components/site/items/iconned-cta';
	import { SVG } from '$lib/components/ui/icon';
	import { ItemIncludes } from '$lib/components/site/items/includes';
	import type { HotelAmenity } from '$lib/directus/hotel-amenities';
	import { SpokenLanguages } from '$lib/components/site/items/languages';
	import { Breadcrum } from '$lib/components/site/navigation/breadcrum';
	import { getDirectusImage } from './utils';
	import { BaseTextContent } from '$lib/components/site/text-content/base';
	import { BannerAlert } from '$lib/components/site/text-content/banner-alert';
	import { Body, Heading } from '$ui/components/typography';

	export let stopover_hotels: { hotel: HotelSchema; amenities: HotelAmenity[] };

	const { gallery, main_image, stars, translations } = stopover_hotels.hotel;

	const currrentTranslation = translations.filter((t) => t.lang_code === $page.data.locale);

	const {
		0: { description, name, promo_name, promo_description }
	} = currrentTranslation;

	const galleryImages = gallery.map((img) => img.directus_files_id);

	const item = stopover_hotels.hotel;

	const labels = $page.data.siteSettings.translations?.[0]?.labels;

	const starsLabel = labels?.filter((label) => label.name === 'hotel-stars')[0];

	const hotelIncludesLabel = labels?.filter((label) => label.name === 'hotel-includes')[0];

	const icons = $page.data.siteSettings.ui_icons?.map((icon) => icon.icons_id);

	const starIcon = icons?.filter((icon) => icon.name === 'star')[0];

	const disclaimer = $page.data.siteSettings.error_messages?.filter((v) => v.error_code === 600)[0];

	const redeemDisclaimer = $page.data.siteSettings.error_messages?.filter(
		(v) => v.error_code === 700
	)[0];
</script>

<svelte:head>
	<title>{name}</title>
	<meta name="description" content={description} />
	<meta property="og:title" content={name} />
	<meta property="og:type" content="article" />
	<meta property="og:url" content={$page.url.href} />
	<meta property="og:image" content="{getDirectusImage(main_image)}?key=19x10-1200" />
	<meta name="twitter:card" content="summary_large_image" />
</svelte:head>

<Hero {galleryImages} {main_image} {name} class="bg-secondary" />
<div class="container mx-auto my-8 space-y-normal">
	<div>
		<Breadcrum {item} />
		<Body size="body-large" class="flex items-center text-grey-600">
			{#if starIcon}
				<SVG data={starIcon?.code} class="size-8 fill-current"></SVG>
			{:else}
				{'Please add a "star" icon to the site'}
			{/if}
			<span>
				{`${stars} ${starsLabel ? starsLabel.value : 'Please add hotels-stars label to site'}`}
			</span>
		</Body>
		<Body size="body-large" class="mb-petit">
			{description}
		</Body>
		{#if promo_name && promo_description}
			<StopoverPromoCard {item}></StopoverPromoCard>
		{/if}
		<div class="mb-4 md:flex md:justify-center">
			<MainCallToAction {item} class="mt-petit"></MainCallToAction>
		</div>
		{#if redeemDisclaimer && promo_name}
			<BannerAlert item={redeemDisclaimer.Text_Content_id}></BannerAlert>
		{/if}
		{#if disclaimer && promo_name}
			<BaseTextContent item={disclaimer.Text_Content_id}></BaseTextContent>
		{/if}
	</div>
	<div class="space-y-4">
		<Heading>
			{#if hotelIncludesLabel}
				{hotelIncludesLabel.value}
			{:else}
				{'Plase include a hotel-includes label to the site'}
			{/if}
		</Heading>
		<ItemIncludes {item} amenites={stopover_hotels.amenities}></ItemIncludes>
	</div>
	<SpokenLanguages {item}></SpokenLanguages>
	<Map {item}></Map>
	<HotelCTAs {item}></HotelCTAs>
</div>
