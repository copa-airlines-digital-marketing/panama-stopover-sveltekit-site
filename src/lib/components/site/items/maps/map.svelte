<script lang="ts">
	import { page } from '$app/stores';
	import { Button } from '$ui/components/button';
	import { getTypographyVariant } from '$lib/components/ui/typography';
	import { isHotelSchema, type HotelSchema } from '$lib/directus/hotels';
	import type { PlaceSchema } from '$lib/directus/place-to-visit';
	import { isRestaurantSchema, type RestaurantSchema } from '$lib/directus/restaurants';
	import { onMount } from 'svelte';

	export let item: HotelSchema | RestaurantSchema | PlaceSchema;

	const { translations } = item;

	const currrentTranslation = translations.filter((t) => t.lang_code === $page.data.locale);

	const {
		0: { name }
	} = currrentTranslation;

	const latLong = item.location;

	const useName = isHotelSchema(item) ? item.use_name : false;

	const helper = isRestaurantSchema(item) ? 'restaurant' : '';

	const labels = $page.data.siteSettings.translations?.[0]?.labels;

	const location = labels?.filter((label) => label.name === 'location')[0];

	const locationNavigate = labels?.filter((label) => label.name === 'location-navigate')[0];

	const mapKey = 'AIzaSyAIeomrDWZ0BM3eTZFMJyvAzx7NfE4-64o';

	const coordinates = { lat: latLong.coordinates[1], lng: latLong.coordinates[0] };

	const namedMapButtonURL = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
		`${name}${helper ? ' ' + helper : ''} Panama`
	).replaceAll('%20', '+')}&center=${latLong.coordinates.reverse.toString()}`;

	const noNameMapButtonURL = `https://www.google.com/maps/dir/?api=1&destination=${latLong.coordinates[1]},${latLong.coordinates[0]}`;

	const initMap = (): void => {
		const mapOptions: google.maps.MapOptions = {
			zoom: 17,
			center: coordinates
		};

		const map = new google.maps.Map(document.getElementById('map') as HTMLElement, mapOptions);

		new google.maps.Marker({
			position: coordinates,
			map: map,
			title: name
		});
	};

	onMount(() => {
		if (useName !== false) return;

		window.initMap = initMap;

		const mapjs = document.createElement('script');
		mapjs.async = true;
		mapjs.defer = true;
		mapjs.src = `https://maps.googleapis.com/maps/api/js?key=${mapKey}&callback=initMap&loading=async`;

		document.head.append(mapjs);
	});
</script>

<div>
	{#if location}
		<h2 class={getTypographyVariant('h2', 'text-primary')}>{location.value}</h2>
		{#if !useName}
			<div
				class="mt-2 mb-6 aspect-4/3 w-full rounded-2xl shadow-md md:aspect-3/1"
				title="Mapa"
				style="border:0"
				id="map"
			></div>
		{:else}
			<iframe
				class="mt-2 mb-6 aspect-4/3 w-full rounded-2xl shadow-md md:aspect-3/1"
				title="Mapa"
				style="border:0"
				loading="lazy"
				allowfullscreen
				referrerpolicy="no-referrer-when-downgrade"
				src="https://www.google.com/maps/embed/v1/place?key=AIzaSyAIeomrDWZ0BM3eTZFMJyvAzx7NfE4-64o
    &q={encodeURIComponent(`${name}${helper ? ' ' + helper : ''} Panama`).replaceAll('%20', '+')}"
			>
			</iframe>
		{/if}

		<div class="md:flex md:justify-center">
			<Button
				href={useName ? namedMapButtonURL : noNameMapButtonURL}
				target="_blank"
				rel="noreferrer nofollow"
				class="font-jakarta"
			>
				{#if locationNavigate}
					{locationNavigate.value}
				{:else}
					{`Please add a location-navigate label to the site`}
				{/if}
			</Button>
		</div>
	{:else}
		{`Please add a location label to the site`}
	{/if}
</div>
