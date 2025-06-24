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
	import { AnunciosImportantes, CheckIn, Tiquetes } from '$ui/components/pictograms';
	import { Body, Heading } from '$ui/components/typography';
	import { ContactCard } from '$lib/components/site/items/cards/contact';
	import { cn } from '$lib/utils';
	import { Alert } from '$lib/components/ui/alerts/alert';
	import { Button } from '$ui/components/button';
	import { Globe, NoIcon, Phone, Filled, Regular, Social } from '$ui/components/icon';
	import { Pill } from '$ui/components/pill';
	import { MapContainer } from '$lib/components/site/items/maps';

	export let stopover_tour: StopoverTour;

	const {
		main_image,
		duration,
		category,
		start_time,
		meeting_point,
		end_point,
		translations,
		gallery,
		operator,
		supported_languages
	} = stopover_tour;

	const {
		coordinates: [meet_lng, meet_lat]
	} = meeting_point;

	const {
		coordinates: [end_lng, end_lat]
	} = end_point;

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

	const getTourTypeLabel = (type: string) => {
		if (type === 'walk-in') return labels?.get('guided-visit');

		if (type === 'pass-by') return labels?.get('photo-stop');

		return `No soportado: ${type}`;
	};

	const getTourTypeIcon = (type: string) => {
		if (type === 'walk-in') return Regular.Walk;

		if (type === 'pass-by') return Regular.Camera;

		return NoIcon;
	};

	const getSocialIcon = (type: string) => {
		if (type === 'instagram') return Social.Instagram;

		if (type === 'website') return Globe;

		if (type === 'facebook') return Social.Facebook;

		if (type === 'tiktok') return Social.Tiktok;

		if (type === 'youtube') return Social.Youtube;

		return NoIcon;
	};

	//new (delete)

	const parseAMPM = (hour24: string) => {
		const [hour, minutes] = hour24.split(':').map(Number);
		const amPm = hour >= 12 ? 'PM' : 'AM';
		return `${hour % 12 || 12}:${minutes.toString().padStart(2, '0')} ${amPm}`;
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
	<div
		class="experience-layout rounded-2xl border border-grey-300 bg-common-white p-6 lg:grid lg:gap-6"
	>
		<Tiquetes.Conexion class="size-16 lg:[grid-area:icon]" />
		<Heading tag="h2" class="text-primary lg:my-0 lg:[grid-area:title]" {customcn}>
			{labels?.get('tour-experience')}
		</Heading>
		<ul class="flex flex-wrap gap-2 lg:[grid-area:categories]">
			{#each category || [] as cat}
				<li>
					<Pill thickness="slim" class="bg-grey-100" let:Text>
						<Text class="text-grey-600">{labels?.get(`tour-category-${cat}`)}</Text>
					</Pill>
				</li>
			{:else}
				<li>
					<Alert>Es necesario asociar el tour operador al tour</Alert>
				</li>
			{/each}
		</ul>
		<div class="my-6 space-y-4 lg:my-0 lg:[grid-area:details]">
			<div class="flex items-center-safe gap-2 md:gap-4">
				<Globe class="size-6 fill-secondary" title={labels?.get('languages')} />
				<ul class="flex items-center gap-1 md:gap-2">
					<Body tag="li" class="mb-0">
						{labels?.get('languages')}:
					</Body>
					{#each supported_languages as lang}
						<Body tag="li" class="mb-0">
							{labels?.get(`support-lang-${lang}`)}
						</Body>
					{/each}
				</ul>
			</div>
			<div class="flex items-center-safe gap-2 md:gap-4">
				<Regular.History class="size-6 fill-secondary" title={labels?.get('duration')} />
				<Body class="mb-0">
					{labels?.get('duration')}: {duration}
					{labels?.get('hours')}
				</Body>
			</div>
			<div class="flex items-center-safe gap-2 md:gap-4">
				<Filled.Time class="size-6 fill-secondary" title={labels?.get('start-time')} />
				<Body class="mb-0">
					{labels?.get('start-time')}: {parseAMPM(start_time || '00:00:00')}
				</Body>
			</div>
		</div>

		<MapContainer
			let:Title
			let:Static
			let:Button
			class="overflow-hidden rounded-xl lg:[grid-area:starting]"
		>
			<Title class="rounded-full bg-background-lightblue px-3 py-1"
				>{labels?.get('start-point')}</Title
			>
			<Static
				mapType="roadmap"
				mapTitle={name}
				center={{ lat: meet_lat, lng: meet_lng }}
				markers={[
					{ location: { lat: meet_lat, lng: meet_lng }, label: labels?.get('start-point')[0] }
				]}
				breakpointSize={{ lg: '300x300' }}
			/>
			<Button
				class="md:mb-2"
				mapType="roadmap"
				mapTitle={name}
				center={{ lat: meet_lat, lng: meet_lng }}
			>
				{labels?.get('location-navigate')}
			</Button>
		</MapContainer>

		<ul class="my-6 space-y-normal lg:my-0 lg:self-center lg:[grid-area:stops]">
			{#each experience || [] as tex}
				{@const { title, description, type, duration, includes_admission } = tex}
				<li>
					<Heading variant="h3" class="my-0">{title}</Heading>
					<Body class="mb-4">{description}</Body>
					<ul class="flex flex-wrap gap-2 md:gap-4">
						<li>
							<Pill
								let:Text
								let:Icon
								class={includes_admission ? 'bg-system-success-faded' : 'bg-grey-700'}
							>
								{#if includes_admission}
									<Icon>
										<Regular.Check
											class={includes_admission ? 'fill-system-success' : 'fill-common-white'}
										/>
									</Icon>
								{:else}
									<Icon>
										<Regular.Close
											class={includes_admission ? 'fill-system-success' : 'fill-common-white'}
										/>
									</Icon>
								{/if}
								<Text class={includes_admission ? 'text-system-success' : 'text-common-white'}>
									{includes_admission
										? labels?.get('admision-included')
										: labels?.get('admision-not-included')}
								</Text>
								<Icon>
									<Filled.Ticket
										class={includes_admission ? 'fill-system-success' : 'fill-common-white'}
									/>
								</Icon>
							</Pill>
						</li>
						<li>
							<Pill let:Text let:Icon class="bg-background-lightblue" theme="transparent">
								<Icon>
									<svelte:component this={getTourTypeIcon(type)} class="fill-primary" />
								</Icon>
								<Text class="text-primary">
									{getTourTypeLabel(type)}
								</Text>
							</Pill>
						</li>
						<li>
							<Pill let:Text let:Icon class="bg-background-lightblue" theme="transparent">
								<Icon>
									<Filled.Time class="fill-primary" title={labels?.get('duration')} />
								</Icon>
								<Text class="text-primary">
									{duration}
									{labels?.get('minutes')}
								</Text>
							</Pill>
						</li>
					</ul>
				</li>
			{:else}
				<Alert>Es necesario agregar las experiencias del tour</Alert>
			{/each}
		</ul>
		<MapContainer
			let:Title
			let:Static
			let:Button
			class="overflow-hidden rounded-xl lg:[grid-area:ending]"
		>
			<Title class="rounded-full bg-background-lightblue px-3 py-1"
				>{labels?.get('end-point')}</Title
			>
			<Static
				mapType="roadmap"
				mapTitle={name}
				center={{ lat: end_lat, lng: end_lng }}
				markers={[{ location: { lat: end_lat, lng: end_lng }, label: labels?.get('end-point')[0] }]}
				breakpointSize={{ lg: '300x300' }}
			/>
			<Button
				class="md:mb-2"
				mapType="roadmap"
				mapTitle={name}
				center={{ lat: end_lat, lng: end_lng }}
			>
				{labels?.get('location-navigate')}
			</Button>
		</MapContainer>
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
