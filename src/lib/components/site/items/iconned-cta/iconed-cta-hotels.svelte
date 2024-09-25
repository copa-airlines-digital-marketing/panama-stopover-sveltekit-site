<script lang="ts">
	import { page } from '$app/stores';
	import type { HotelSchema } from '$lib/directus/hotels';
	import { IconnedCTA } from '$lib/components/site/ui/icon-cta';
	import { SVG } from '$lib/components/ui/foundations/icon';

	export let item: HotelSchema;

	const { booking_email, phone_number } = item;

	const icons = $page.data.siteSettings.ui_icons?.map((icon) => icon.icons_id);

	const mailIcon = icons?.filter((icon) => icon.name === 'pictogram-mail')[0];

	const phoneIcon = icons?.filter((icon) => icon.name === 'pictogram-phone')[0];

	const labels = $page.data.siteSettings.translations?.[0]?.labels;

	const mailLabel = labels?.filter((label) => label.name === 'hotel-mail')[0];

	const phoneLabel = labels?.filter((label) => label.name === 'hotel-call')[0];
</script>

<div class="grid grid-cols-2 gap-4">
	<IconnedCTA
		href="mailto:{booking_email}"
		target="_blank"
		rel="noreferrer nofollow"
		theme="DEFAULT"
		let:Icon
	>
		{#if mailIcon}
			<Icon>
				<SVG data={mailIcon.code}></SVG>
			</Icon>
		{:else}
			{'Please add an icon with name pictogram-mail to the site'}
		{/if}
		{#if mailLabel}
			<span>{mailLabel.value}</span>
		{:else}
			{'Please add a label with name hotel-mail to the site'}
		{/if}
	</IconnedCTA>

	<IconnedCTA
		href="tel:{phone_number}"
		target="_blank"
		rel="noreferrer nofollow"
		theme="DEFAULT"
		let:Icon
	>
		{#if phoneIcon}
			<Icon>
				<SVG data={phoneIcon.code}></SVG>
			</Icon>
		{:else}
			{'Please add an icon with name pictogram-phone to the site'}
		{/if}
		{#if phoneLabel}
			<span>{phoneLabel.value}</span>
		{:else}
			{'Please add a label with name hotel-call to the site'}
		{/if}
	</IconnedCTA>
</div>
