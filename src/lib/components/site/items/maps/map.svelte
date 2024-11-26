<script lang="ts">
	import { page } from '$app/stores';
	import { Button } from '$lib/components/ui/foundations/button';
	import { getTypographyVariant } from '$lib/components/ui/foundations/typography';
	import type { HotelSchema } from '$lib/directus/hotels';
	import type { PlaceSchema } from '$lib/directus/place-to-visit';
	import { isRestaurantSchema, type RestaurantSchema } from '$lib/directus/restaurants';

	export let item: HotelSchema | RestaurantSchema | PlaceSchema;

	const { translations } = item;

	const currrentTranslation = translations.filter((t) => t.lang_code === $page.data.locale);

	const {
		0: { name }
	} = currrentTranslation;

	const latLong = item.location;

	const helper = isRestaurantSchema(item) ? 'restaurant' : '';

	const labels = $page.data.siteSettings.translations?.[0]?.labels;

	const location = labels?.filter((label) => label.name === 'location')[0];

	const locationNavigate = labels?.filter((label) => label.name === 'location-navigate')[0];
</script>

<div>
	{#if location}
		<h2 class={getTypographyVariant('h2', 'text-primary')}>{location.value}</h2>
	{:else}
		{`Please add a location label to the site`}
	{/if}

	<iframe
		class="mb-6 mt-2 aspect-[4/3] w-full rounded-2xl shadow-md md:aspect-[3/1]"
		title="Mapa"
		style="border:0"
		loading="lazy"
		allowfullscreen
		referrerpolicy="no-referrer-when-downgrade"
		src="https://www.google.com/maps/embed/v1/place?key=AIzaSyAIeomrDWZ0BM3eTZFMJyvAzx7NfE4-64o
  &q={encodeURIComponent(`${name}${helper ? ' ' + helper : ''} Panama`).replaceAll('%20', '+')}"
	>
	</iframe>

	<div class="md:flex md:justify-center">
		<Button
			href="https://www.google.com/maps/search/?api=1&query={encodeURIComponent(
				`${name}${helper ? ' ' + helper : ''} Panama`
			).replaceAll('%20', '+')}&center={latLong.coordinates.reverse.toString()}"
			target="_blank"
			rel="noreferrer nofollow"
		>
			{#if locationNavigate}
				{locationNavigate.value}
			{:else}
				{`Please add a location-navigate label to the site`}
			{/if}
		</Button>
	</div>
</div>
