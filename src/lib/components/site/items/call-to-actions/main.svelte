<script lang="ts">
	import { page } from '$app/stores';
	import type { TourSchema } from '$lib/domain/tours';
	import { Button } from '$ui/components/button';
	import type { HotelSchema } from '$lib/domain/hotels';
	import type { PlaceSchema } from '$lib/domain/places';
	import type { RestaurantSchema } from '$lib/domain/restaurants';
	import { isNumberArray } from '$lib/utils';
	import { Alert } from '$lib/components/ui/alerts/alert';
	import { Pre } from '$lib/components/testing';
	import type { PackageSchema } from '$lib/domain/packages';
	import type { TransportationSchema } from '$lib/domain/transportation';

	export let item:
		| HotelSchema
		| RestaurantSchema
		| PlaceSchema
		| TourSchema
		| PackageSchema
		| TransportationSchema;

	const { translations } = item;
	type TranslationWithUrl = {
		lang_code?: string;
		languages_code?: string;
		url?: string | null;
	};

	const labels = $page.data.siteSettings.translations?.[0]?.labels;

	const mainCTAText = labels?.filter((label) => label.name === 'book-now')[0];

	const normalizeHref = (href: string | null | undefined) => {
		const value = href?.trim();
		if (!value) return '';
		if (value.startsWith('//')) return `https:${value}`;
		if (/^(https?:|mailto:|tel:|#|\/)/.test(value)) return value;
		return `https://${value}`;
	};
</script>

{#if !!translations && typeof translations !== 'number' && !isNumberArray(translations)}
	{@const trans = (translations as TranslationWithUrl[]).filter((t) => (t.lang_code || t.languages_code) === $page.data.locale)}
	{@const ctaHref = normalizeHref(trans?.[0].url)}
	{#if ctaHref}
		<Button href={ctaHref} rel="noreferrer nofollow" target="_blank" {...$$restProps}>
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
