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
	import { Button } from '$ui/components/button';
	import { Globe, NoIcon, Phone, Social } from '$ui/components/icon';

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

	const getTourOperatorInitials = (name: string) => {
		const splitedName = name.split(' ');
		const firstName = splitedName[0];
		const lastName = splitedName[splitedName.length - 1];

		if (firstName === lastName) return firstName.substring(0, 2).toUpperCase();

		return `${firstName[0]}${lastName[0]}`.toUpperCase();
	};

	const getConctactFormIcon = (form: string) => {
		if (form === 'phone') return Phone;

		if (form === 'e-mail') return Social.Email;

		if (form === 'whatsapp') return Social.Whatsapp;

		return NoIcon;
	};

	const getConctactFormLink = (form: string, target: string) => {
		if (form === 'phone') return `tel:${target}`;

		if (form === 'e-mail') return `mailto:${target}`;

		if (form === 'whatsapp') return `https://wa.me/${target}`;
	};

	const getSocialIcon = (type: string) => {
		if (type === 'instagram') return Social.Instagram;

		if (type === 'website') return Globe;

		if (type === 'facebook') return Social.Facebook;

		if (type === 'tiktok') return Social.Tiktok;

		if (type === 'youtube') return Social.Youtube;

		return NoIcon;
	};
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
		<InformativeBoxContainer let:Box>
			<Box alignment="center" class="border-primary bg-primary" let:Icon let:Title let:Description>
				<Icon>
					<CheckIn style="transparent" />
				</Icon>
				<Title theme="invert">
					{labels?.get('included')}
				</Title>
				<Description tag="ul" theme="invert">
					<ul>
						{#each included?.map((i) => i.name) || [] as item}
							<li>{item}</li>
						{/each}
					</ul>
				</Description>
			</Box>
			<Box alignment="center" class="bg-grey-700" let:Icon let:Title let:Description>
				<Icon>
					<AnunciosImportantes style="monochrome" />
				</Icon>
				<Title theme="invert">{labels?.get('not-included')}</Title>
				<Description tag="ul" theme="invert">
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
			<ContactCard let:Avatar let:Name class="bg-background-lightblue">
				<Avatar let:Image let:Fallback>
					<Image src={getDirectusImage(main_image)} alt={name} />
					<Fallback>{getTourOperatorInitials(name)}</Fallback>
				</Avatar>
				<Name class="my-0">
					<Body tag="span" size="body-small" class="my-0">{labels?.get('tour-operated-by')}</Body>
					<br />
					{name}
				</Name>
				<div class="[grid-area:contact]">
					<Heading tag="h5" class="sr-only" variant="h4">
						{labels?.get('tour-operator-contact')}
					</Heading>
					<ul class="flex gap-1 md:gap-2">
						{#each contact as c}
							<li>
								<Button
									variant="solid-primary-light"
									size="slim"
									href={getConctactFormLink(c.form, c.contact)}
									target="_blank"
									rel="noreferrer nofollow"
								>
									<svelte:component this={getConctactFormIcon(c.form)} />
								</Button>
							</li>
						{/each}
					</ul>
				</div>
				<div class="[grid-area:social]">
					<Heading tag="h5" class="sr-only" variant="h4"
						>{labels?.get('tour-operator-socials')}</Heading
					>
					<ul class="flex gap-1 md:gap-2">
						{#each network as social}
							<li>
								<Button
									variant="solid-primary-light"
									size="slim"
									href={social.link}
									target="_blank"
									rel="noreferrer nofollow"
								>
									<svelte:component this={getSocialIcon(social.type)}></svelte:component>
								</Button>
							</li>
						{/each}
					</ul>
				</div>
			</ContactCard>
		</div>
	{:else}
		<Alert>Es necesario asociar el tour operador al tour</Alert>
	{/if}
</div>
