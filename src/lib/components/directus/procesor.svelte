<script lang="ts">
	import type { PageSchema } from '$lib/directus/page';
	import type { SiteSettingsSchema } from '$lib/directus/site-settings';
	import type { HotelSchema } from '$lib/directus/hotels';
	import type { RestaurantSchema } from '$lib/directus/restaurants';
	import type { PlaceSchema } from '$lib/directus/place-to-visit';
	import type { TextContentSchema } from '$lib/directus/text-content';
	import { isNotNil } from 'ramda';
	import {
		EndOfPage,
		Head,
		HotelPage,
		Navigation,
		Section,
		Page,
		PlacePage,
		RestaurantPage,
		StartOfPage,
		SingleContentPage
	} from '$lib/components/directus';
	import { say } from '$lib/utils';
	import type { SectionSchema } from '$lib/directus/section';

	export let locale: string;
	export let siteSettings: SiteSettingsSchema;
	export let layout: PageSchema;
	export let layoutSections: SectionSchema[];
	export let page: PageSchema | undefined = undefined;
	export let pageSections: SectionSchema[] | undefined = undefined;
	export let stopover_hotels: HotelSchema | undefined = undefined;
	export let stopover_restaurants: RestaurantSchema | undefined = undefined;
	export let stopover_place_to_visit: PlaceSchema | undefined = undefined;
	export let single_content: TextContentSchema | null | undefined = undefined;
	export let environment: string;

	const indexPage =
		environment === 'prod' &&
		(page?.index ||
			!!stopover_hotels ||
			!!stopover_restaurants ||
			!!stopover_place_to_visit ||
			!!single_content);

	const [headerSection, footerSection] = layoutSections;
</script>

<Head
	site_head_code={siteSettings.head_code}
	layout_head_code={layout.head_code}
	page_head_code={page?.head_code}
	{indexPage}
/>

<Section section={headerSection}></Section>

<StartOfPage
	site_start_of_page_code={siteSettings.start_of_body_code}
	layout_start_of_page_code={layout.start_of_body_code}
	page_start_of_page_code={page?.start_of_body_code}
/>

{#if isNotNil(single_content)}
	<SingleContentPage {siteSettings} {layout} {single_content} {locale} />
{:else if isNotNil(page)}
	<Page {siteSettings} {layout} {page} {pageSections} />
{:else if isNotNil(stopover_hotels)}
	<HotelPage {siteSettings} {layout} {stopover_hotels} />
{:else if isNotNil(stopover_restaurants)}
	<RestaurantPage {siteSettings} {layout} {stopover_restaurants} />
{:else if isNotNil(stopover_place_to_visit)}
	<PlacePage {siteSettings} {layout} {stopover_place_to_visit} />
{/if}

<Section section={footerSection}></Section>

<EndOfPage
	site_end_of_page_code={siteSettings.end_of_body_code}
	layout_end_of_page_code={layout.end_of_body_code}
	page_end_of_page_code={page?.end_of_body_code}
/>
