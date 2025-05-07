<script lang="ts">
	import { getTypography, getTypographyVariant } from '$lib/components/ui/typography';
	import { Hero } from '$lib/components/site/items';
	import { page } from '$app/stores';
	import { StopoverPromoCard } from '$lib/components/site/items/cards';
	import { MainCallToAction } from '$lib/components/site/items/call-to-actions';
	import { Map as MapDisplay } from '$lib/components/site/items/maps';
	import { SVG } from '$lib/components/ui/icon';
	import { ItemIncludes } from '$lib/components/site/items/includes';
	import { SpokenLanguages } from '$lib/components/site/items/languages';
	import { Breadcrum } from '$lib/components/site/navigation/breadcrum';
	import { getDirectusImage } from './utils';
	import { BaseTextContent } from '$lib/components/site/text-content/base';
	import { BannerAlert } from '$lib/components/site/text-content/banner-alert';
	import type { StopoverTour } from '$cms/collections/stopover_tours/stopover_tours';
	import { isStopoverTourTranslations } from '$lib/directus/tours/utlis';
	import type { StopoverTourTranslations } from '$cms/collections/stopover_tour_translations';
	import { InformativeBoxContainer } from '$ui/components/boxes/informative';
	import { AnunciosImportantes, CheckIn } from '$ui/components/pictograms';
	import { Heading } from '$ui/components/typography';
	import { cn } from '$lib/utils';
	import { includes } from 'ramda';

	export let stopover_tour: StopoverTour;

	const { main_image, duration, category, end_point, translations, gallery, operator } =
		stopover_tour;

	const translation = isStopoverTourTranslations(translations)
		? translations.filter((t) => t.languages_code === $page.data.locale)
		: [<StopoverTourTranslations>{}];

	const {
		languages_code,
		path,
		name,
		description,
		experience,
		included,
		not_included,
		promo_name,
		promo_description
	} = translation[0];

	const galleryImages = true ? gallery.map((img) => img.directus_files_id) : gallery;

	const disclaimer = $page.data.siteSettings.error_messages?.filter((v) => v.error_code === 600)[0];

	const redeemDisclaimer = $page.data.siteSettings.error_messages?.filter(
		(v) => v.error_code === 700
	)[0];

	const labels = $page.data.siteSettings.translations?.[0]?.labels?.reduce(
		(a, c) => a.set(c.name, c.value),
		new Map()
	);

	const customcn = cn;
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

<Hero {galleryImages} {name} {main_image} class="bg-secondary" />
<div class="space-y-normal container mx-auto my-8">
	<div>
		<Breadcrum item={stopover_tour} />
		<p class={getTypography('body-large', 'body', 'mb-petit')}>
			{description}
		</p>
		{#if promo_name && promo_description}
			<StopoverPromoCard item={stopover_tour}></StopoverPromoCard>
		{/if}
		<div class="my-4 md:flex md:justify-center">
			<MainCallToAction item={stopover_tour} class="mt-petit"></MainCallToAction>
		</div>
		{#if redeemDisclaimer && promo_name}
			<BannerAlert item={redeemDisclaimer.Text_Content_id}></BannerAlert>
		{/if}
		{#if disclaimer && promo_name}
			<BaseTextContent item={disclaimer.Text_Content_id}></BaseTextContent>
		{/if}
	</div>
	<div>
		<Heading tag="h2" {customcn} class="font-jakarta">
			{labels?.get('tour-experience')}
		</Heading>
	</div>
	<div>
		<Heading tag="h2" {customcn} class="font-jakarta">
			{labels?.get('tour-includes')}
		</Heading>
		<InformativeBoxContainer let:Box>
			<Box alignment="center" class="bg-background-lightblue" let:Icon let:Title let:Description>
				<Icon>
					<CheckIn style="transparent" />
				</Icon>
				<Title>Incluye</Title>
				<Description>
					<ul>
						{#each included?.map((i) => i.name) || [] as item}
							<li>{item}</li>
						{/each}
					</ul>
				</Description>
			</Box>
			<Box alignment="center" let:Icon let:Title let:Description>
				<Icon>
					<AnunciosImportantes />
				</Icon>
				<Title>No incluye</Title>
				<Description>
					yo
					{#each not_included?.map((i) => i.name) || [] as item}
						<li>{item}</li>
					{/each}
				</Description>
			</Box>
		</InformativeBoxContainer>
	</div>
	<!--
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
    -->
</div>
