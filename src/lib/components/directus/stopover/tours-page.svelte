<script lang="ts">
	import type { StopoverTour } from '$cms/collections/stopover_tours/stopover_tours';
	import type { StopoverTourTranslations } from '$cms/collections/stopover_tour_translations';
	import { Hero } from '$lib/components/site/items';
	import { page } from '$app/stores';
	import { StopoverPromoCard } from '$lib/components/site/items/cards';
	import { MainCallToAction } from '$lib/components/site/items/call-to-actions';
	import { Breadcrum } from '$lib/components/site/navigation/breadcrum';
	import { getDirectusImage } from './utils';
	import { BaseTextContent } from '$lib/components/site/text-content/base';
	import { BannerAlert } from '$lib/components/site/text-content/banner-alert';
	import { isStopoverTourTranslations } from '$lib/directus/tours/utlis';
	import { InformativeBoxContainer } from '$ui/components/boxes/informative';
	import { AnunciosImportantes, CheckIn } from '$ui/components/pictograms';
	import { Body, Heading } from '$ui/components/typography';
	import { ContactCard } from '$lib/components/site/items/cards/contact';
	import { cn } from '$lib/utils';
	import { Alert } from '$lib/components/ui/alerts/alert';
	import { Fallback } from '$ui/components/avatar';
	import Name from '$lib/components/ui/cards/promo-show/name.svelte';

	export let stopover_tour: StopoverTour;

	const { main_image, duration, category, end_point, translations, gallery, operator } =
		stopover_tour;

	const translation = isStopoverTourTranslations(translations)
		? translations.filter((t) => t.languages_code === $page.data.locale)
		: [<StopoverTourTranslations>{}];

	const { name, description, experience, included, not_included, promo_name, promo_description } =
		translation[0];

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
<div class="container mx-auto my-8 space-y-normal">
	<div>
		<Breadcrum item={stopover_tour} />
		<Body size="body-large" class="mb-petit">
			{description}
		</Body>
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
		<Heading tag="h2" {customcn}>
			{labels?.get('tour-experience')}
		</Heading>
	</div>
	<div>
		<Heading tag="h2" {customcn}>
			{labels?.get('tour-includes')}
		</Heading>
		<InformativeBoxContainer let:Box>
			<Box alignment="center" class="bg-background-lightblue" let:Icon let:Title let:Description>
				<Icon>
					<CheckIn style="transparent" />
				</Icon>
				<Title>{labels?.get('included')}</Title>
				<Description tag="ul">
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
				<Title>{labels?.get('not-included')}</Title>
				<Description tag="ul">
					{#each not_included?.map((i) => i.name) || [] as item}
						<li>{item}</li>
					{/each}
				</Description>
			</Box>
		</InformativeBoxContainer>
	</div>
	{#if operator}
		{@const { name, main_image, contact, network } = operator}
		<div>
			<Heading tag="h2" {customcn}>
				{labels?.get('tour-operated-by')}
			</Heading>
			{JSON.stringify(operator, null, 2)}
			<ContactCard let:Avatar let:Name>
				<Avatar let:Image let:Fallback>
					<Image src={getDirectusImage(main_image)} alt={name} />
					<Fallback>TT</Fallback>
				</Avatar>
				<Name>
					{name}
				</Name>
			</ContactCard>
		</div>
	{:else}
		<Alert>Es necesario asociar el tour operador al tour</Alert>
	{/if}
</div>
