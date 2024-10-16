<script lang="ts">
	import { PromoShow } from '$lib/components/ui/patterns/cards/promo-show';
	import type { StopoverHotelModuleSchema } from '$lib/directus/stopover_hotel_module';
	import { toString, map, replace, isNotNil } from 'ramda';
	import { page } from '$app/stores';
	import { getDirectusImage } from '../../stopover/utils';
	import KeyboardArrowRight from '$lib/components/ui/foundations/icon/keyboard-arrow-right.svelte';
	import { getPathRecursive } from '$lib/i18n/cannonicals';
	import type { PathSchema } from '$lib/directus/page';

	export let item: StopoverHotelModuleSchema;

	const { max_items, highlight_only, promo_only, sort, collection, pilar } = item;

	const requestURL = new URL(`/api/modules`, $page.url.href);
	requestURL.searchParams.append('collection', collection);
	requestURL.searchParams.append('max-items', toString(max_items));
	requestURL.searchParams.append('highlights', toString(highlight_only));
	requestURL.searchParams.append('promo-only', toString(promo_only));
	requestURL.searchParams.append('locale', $page.data.locale);
	const sorts = (sort && sort.map((v) => (v.order === 'asc' ? v.by : '-' + v.by))) || [];
	sorts.forEach((v) => requestURL.searchParams.append('sort', v));
	pilar && pilar.forEach((name) => requestURL.searchParams.append('pilar', name));

	const cta =
		$page.data.siteSettings.translations?.[0]?.labels?.filter((v) => v.name === 'view-more')?.[0] ||
		'Add view more label';

	async function getItems() {
		const request = await fetch(requestURL, { method: 'GET' });
		const response = await request.json();
		return response;
	}

	function calculatePath(schema: PathSchema) {
		const path = map(replace(/\/\//g, '/'), getPathRecursive(schema));
		return path[$page.data.locale];
	}
</script>

{#await getItems()}
	<div class="item-show-grid my-6 grid gap-2">
		{#each new Array(4) as skeli}
			<PromoShow let:Children>
				<Children.Image class="aspect-video bg-grey-100" />
				<Children.Discount class="h-4 w-10 animate-pulse justify-self-end bg-grey-300" />
				<Children.Title class="h-5 animate-pulse rounded bg-grey-300" />
				<Children.CallToAction
					class="h-3 w-10 animate-pulse justify-self-end rounded bg-grey-300"
				/>
			</PromoShow>
		{/each}
	</div>
{:then value}
	<ul class="item-show-grid my-6 grid items-stretch gap-2 md:gap-4">
		{#each value as promo}
			{#if promo.parent_page}
				<li>
					<PromoShow
						let:Children
						href="{calculatePath(promo.parent_page)}/{promo.translations[0].path}"
					>
						<Children.Image>
							<img
								src="{getDirectusImage(promo.main_image)}&key=2-1x600"
								alt=""
								class="h-auto w-full"
							/>
						</Children.Image>
						{#if promo.promo_discount_percent || promo.promo_discount_amount}
							<Children.Discount>
								-{promo.promo_discount_percent ||
									Math.round(promo.promo_discount_amount)}{promo.promo_discount_percent
									? '%'
									: ' USD'}
							</Children.Discount>
						{/if}
						<Children.Title>
							{promo.translations[0].name}
						</Children.Title>
						{#if isNotNil(promo.translations[0].promo_name)}
							<Children.Name>{promo.translations[0].promo_name}</Children.Name>
						{/if}
						<Children.CallToAction>
							{cta.value}
							<KeyboardArrowRight class="size-3 fill-current md:size-4" />
						</Children.CallToAction>
					</PromoShow>
				</li>
			{/if}
		{/each}
	</ul>
{:catch error}
	An error ocurred {error}
{/await}

<style lang="postcss">
	.item-show-grid {
		@apply grid-cols-[repeat(auto-fit,minmax(140px,1fr))] md:grid-cols-[repeat(auto-fill,minmax(320px,1fr))];
	}
</style>
