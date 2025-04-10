<script lang="ts">
	import type { HotelSchema } from '$lib/directus/hotels';
	import type { PlaceSchema } from '$lib/directus/place-to-visit';
	import type { RestaurantSchema } from '$lib/directus/restaurants';
	import { page } from '$app/stores';
	import { SVG } from '$lib/components/ui/icon';
	import { getTypography } from '$lib/components/ui/typography';

	export let item: HotelSchema | RestaurantSchema | PlaceSchema;

	const { supported_languages } = item;

	const icons = $page.data.siteSettings.ui_icons?.map((icon) => icon.icons_id);

	const iconGlobe = icons?.filter((icon) => icon.name === 'globe')[0];

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
		{#if iconGlobe}
			<SVG data={iconGlobe.code} class="size-7 fill-primary"></SVG>
		{:else}
			{'Please include a globe icon to the site'}
		{/if}
		<ul class="flex gap-1">
			{#each supported_languages as lang}
				<li class={getTypography('body-large', 'body')}>
					{langs[lang].value}
				</li>
			{/each}
		</ul>
	</div>
{/if}
