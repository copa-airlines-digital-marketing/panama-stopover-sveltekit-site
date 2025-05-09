<script lang="ts">
	import type { RestaurantSchema } from '$lib/directus/restaurants';
	import { page } from '$app/stores';
	import { getDirectusImage } from './utils';
	import { Hero } from '$lib/components/site/items';
	import { Breadcrum } from '$lib/components/site/navigation/breadcrum';
	import { StopoverPromoCard } from '$lib/components/site/items/cards';
	import { MainCallToAction } from '$lib/components/site/items/call-to-actions';
	import { SpokenLanguages } from '$lib/components/site/items/languages';
	import { Map } from '$lib/components/site/items/maps';
	import { BaseTextContent } from '$lib/components/site/text-content/base';
	import { BannerAlert } from '$lib/components/site/text-content/banner-alert';
	import { Body } from '$ui/components/typography';

	export let stopover_restaurants: RestaurantSchema;

	const { gallery, main_image, translations } = stopover_restaurants;

	const currrentTranslation = translations.filter((t) => t.lang_code === $page.data.locale);

	const {
		0: { description, name, promo_name, promo_description }
	} = currrentTranslation;

	const galleryImages = gallery.map((img) => img.directus_files_id);

	const item = stopover_restaurants;

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

<Hero {galleryImages} {main_image} {name} class="bg-stopover-gastronomy" />
<div class="container mx-auto my-8 space-y-normal">
	<div>
		<Breadcrum {item} />
		<Body size='body-large' class='mb-petit'>
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
	<div class="space-y-8">
		<SpokenLanguages {item}></SpokenLanguages>
	</div>
	<Map {item}></Map>
</div>
