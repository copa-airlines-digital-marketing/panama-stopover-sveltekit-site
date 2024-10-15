<script lang="ts">
	import type { TextContentSchema } from '$lib/directus/text-content';
	import { isNotNil } from 'ramda';
	import {
		EndOfPage,
		Head,
		HotelPage,
		Section,
		Page,
		PlacePage,
		RestaurantPage,
		StartOfPage,
		SingleContentPage
	} from '$lib/components/directus';
	import { getCookie, say, setCookie } from '$lib/utils';
	import { ScrollArea } from 'bits-ui';
	import { getCannonicals } from '$lib/i18n/cannonicals';
	import { setPageCannonicals } from './context';
	import { page } from '$app/stores';
	import { Drawer } from '../ui/master/drawer';
	import { onMount } from 'svelte';
	import { CloseIcon } from '../ui/foundations/icon';

	$: environment = $page.data.environment;
	$: siteSettings = $page.data.siteSettings;
	$: layout = $page.data.layout;
	$: layoutSections = $page.data.layoutSections;
	$: locale = $page.data.locale;
	$: pageInfo = $page.data.page;
	$: pageSections = $page.data.pageSections;
	$: stopover_hotels = $page.data.stopover_hotels;
	$: stopover_place_to_visit = $page.data.stopover_place_to_visit;
	$: stopover_restaurants = $page.data.stopover_restaurants;

	export let single_content: TextContentSchema | null | undefined = undefined;

	$: indexPage =
		environment === 'prod' &&
		(pageInfo?.index ||
			!!stopover_hotels ||
			!!stopover_restaurants ||
			!!stopover_place_to_visit ||
			!!single_content);

	$: headerSection = layoutSections[0];
	$: footerSection = layoutSections[1];
	$: cookieBanner = layoutSections[2];

	$: item = pageInfo || stopover_hotels?.hotel || stopover_restaurants || stopover_place_to_visit;

	$: cannonicals = item && getCannonicals(item);

	$: cannonicals && setPageCannonicals(cannonicals);

	let bannerTrigger = false;

	function onOpenChangeCookieBanner(open: boolean) {
		if (!open) setCookie('gdpr', 'accept', 14 * 30);
	}

	onMount(() => {
		const cookie = JSON.parse(getCookie('gdpr') || 'false');

		if (!cookie) bannerTrigger = true;
	});
</script>

<Head
	site_head_code={siteSettings.head_code}
	layout_head_code={layout.head_code}
	page_head_code={pageInfo?.head_code}
	{indexPage}
/>

<StartOfPage
	site_start_of_page_code={siteSettings.start_of_body_code}
	layout_start_of_page_code={layout.start_of_body_code}
	page_start_of_page_code={pageInfo?.start_of_body_code}
/>

<ScrollArea.Root class="relative">
	<ScrollArea.Viewport class="h-svh w-full">
		<ScrollArea.Content>
			<div class="relative grid min-h-svh grid-cols-1 grid-rows-[auto_1fr_auto]">
				<div class="z-50 col-start-1 row-start-1">
					{#if headerSection}
						<Section section={headerSection}></Section>
					{:else}
						{say('header section in layout is required', headerSection)}
					{/if}
				</div>

				<main class="col-start-1 row-span-2 row-start-1">
					{#if isNotNil(single_content)}
						<SingleContentPage {layout} {single_content} {locale} />
					{:else if isNotNil(pageInfo)}
						<Page pageItem={pageInfo} {pageSections} {layout} />
					{:else if isNotNil(stopover_hotels)}
						<HotelPage {stopover_hotels} />
					{:else if isNotNil(stopover_restaurants)}
						<RestaurantPage {siteSettings} {layout} {stopover_restaurants} />
					{:else if isNotNil(stopover_place_to_visit)}
						<PlacePage {siteSettings} {layout} {stopover_place_to_visit} />
					{/if}
				</main>

				{#if footerSection}
					<div class="col-start-1 row-start-3">
						<Section section={footerSection}></Section>
					</div>
				{:else}
					{say('footer section in layout is required', footerSection)}
				{/if}
				{#if cookieBanner}
					<Drawer
						let:Content
						let:Close
						bind:open={bannerTrigger}
						onOpenChange={onOpenChangeCookieBanner}
					>
						<Content>
							<div class="container mx-auto flex items-start">
								<Section section={cookieBanner}></Section>
								<Close>
									<CloseIcon class="size-6 fill-primary-light"></CloseIcon>
								</Close>
							</div>
						</Content>
					</Drawer>
				{/if}
			</div>
		</ScrollArea.Content>
	</ScrollArea.Viewport>
	<ScrollArea.Scrollbar orientation="vertical">
		<ScrollArea.Thumb />
	</ScrollArea.Scrollbar>
</ScrollArea.Root>

<EndOfPage
	site_end_of_page_code={siteSettings.end_of_body_code}
	layout_end_of_page_code={layout.end_of_body_code}
	page_end_of_page_code={pageInfo?.end_of_body_code}
/>
