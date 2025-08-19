<script lang="ts">
	import { page } from '$app/stores';
	import type { StopoverTour } from '$cms/collections/stopover_tours/stopover_tours';
	import { Button } from '$ui/components/button';
	import type { HotelSchema } from '$lib/directus/hotels';
	import type { PlaceSchema } from '$lib/directus/place-to-visit';
	import type { RestaurantSchema } from '$lib/directus/restaurants';
	import { isNumberArray } from '$lib/utils';
	import { Alert } from '$lib/components/ui/alerts/alert';
	import { Pre } from '$lib/components/testing';
	import type { StopoverPackageQuery } from '$lib/directus/package/types';
	import type { TransportationQuery } from '$lib/directus/transportation/types';

	export let item:
		| HotelSchema
		| RestaurantSchema
		| PlaceSchema
		| StopoverTour
		| StopoverPackageQuery
		| TransportationQuery;

	const { translations } = item;

	const labels = $page.data.siteSettings.translations?.[0]?.labels;

	const mainCTAText = labels?.filter((label) => label.name === 'book-now')[0];
</script>

{#if !!translations && typeof translations !== 'number' && !isNumberArray(translations)}
	{@const trans = translations.filter((t) => t.lang_code || t.languages_code === $page.data.locale)}
	{#if trans?.[0].url}
		<Button href={trans?.[0].url} rel="noreferrer nofollow" target="_blank" {...$$restProps}>
			{#if mainCTAText}
				{mainCTAText.value}
			{:else}
				{'Please add a promo icon to the site, that matches the name: pictogram-discount-code'}
			{/if}
		</Button>
	{/if}
{:else}
	<Alert>Missing item or bad item request</Alert>
	<Pre name="Call to actions item" value={item} />
{/if}
