<script lang="ts">
	import type { HotelSchema } from '$lib/domain/hotels';
	import type { PlaceSchema } from '$lib/domain/places';
	import type { RestaurantSchema } from '$lib/domain/restaurants';
	import { page } from '$app/stores';
	import { getTypography } from '$ui/components/typography';
	import { Globe } from '$ui/components/icon';
	import type { StopoverPackageQuery } from '$lib/directus/package/types';
	import type { TransportationQuery } from '$lib/directus/transportation/types';

	export let item:
		| HotelSchema
		| RestaurantSchema
		| PlaceSchema
		| StopoverPackageQuery
		| TransportationQuery;

	const { supported_languages } = item;

	const icons = $page.data.siteSettings.ui_icons?.map((icon) => icon.icons_id);

	const labels = $page.data.siteSettings.translations?.[0]?.labels;

	const langs = {
		es: labels?.filter((label) => label.name === 'support-lang-es')[0],
		en: labels?.filter((label) => label.name === 'support-lang-en')[0],
		pt: labels?.filter((label) => label.name === 'support-lang-pt')[0],
		fr: labels?.filter((label) => label.name === 'support-lang-fr')[0]
	};
</script>

{#if supported_languages}
	<div class="flex items-center gap-2">
		<Globe class="size-6 fill-primary" />
		<ul class="flex gap-1">
			{#each supported_languages as lang, i}
				<li class={getTypography('body-large', 'body')}>
					{langs[lang].value + `${i < supported_languages.length - 1 ? ',' : ''}`}
				</li>
			{/each}
		</ul>
	</div>
{/if}
