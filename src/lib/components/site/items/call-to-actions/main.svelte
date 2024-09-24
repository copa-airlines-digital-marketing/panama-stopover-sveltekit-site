<script lang="ts">
	import { page } from '$app/stores';
	import { Button } from '$lib/components/ui/foundations/button';
	import type { HotelSchema } from '$lib/directus/hotels';
	import type { PlaceSchema } from '$lib/directus/place-to-visit';
	import type { RestaurantSchema } from '$lib/directus/restaurants';

	export let item: HotelSchema | RestaurantSchema | PlaceSchema;

	const { translations } = item;

	const currrentTranslation = translations.filter((t) => t.lang_code === $page.data.locale);

	const {
		0: { url }
	} = currrentTranslation;

	const labels = $page.data.siteSettings.translations?.[0]?.labels;

	const mainCTAText = labels?.filter((label) => label.name === 'book-now')[0];
</script>

{#if url}
	<Button href={url} rel="noreferrer nofollow" target="_blank">
		{#if mainCTAText}
			{mainCTAText.value}
		{:else}
			{'Please add a promo icon to the site, that matches the name: pictogram-discount-code'}
		{/if}
	</Button>
{/if}
