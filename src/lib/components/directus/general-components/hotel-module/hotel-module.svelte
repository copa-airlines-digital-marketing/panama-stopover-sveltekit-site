<script lang="ts">
	import { PromoShow } from '$lib/components/ui/patterns/cards/promo-show';
	import type { StopoverHotelModuleSchema } from '$lib/directus/stopover_hotel_module';
	import { toString } from 'ramda';
	import { page } from '$app/stores';

	export let item: StopoverHotelModuleSchema;

	const { max_items, highlight_only, sort } = item;

	const requestURL = new URL('/api/modules/hotels', $page.url.href);
	requestURL.searchParams.append('max-items', toString(max_items));
	requestURL.searchParams.append('highlights', toString(highlight_only));
	const sorts = (sort && sort.map((v) => (v.order === 'asc' ? v.by : '-' + v.by))) || [];
	sorts.forEach((v) => requestURL.searchParams.append('sort', v));
</script>

{requestURL}
<div class="item-show-grid my-6 grid gap-2">
	{#each new Array(4) as skeli}
		<PromoShow let:Children>
			<Children.Image class="aspect-video bg-grey-100" />
			<Children.Discount class="h-4 w-10 animate-pulse justify-self-end bg-grey-300" />
			<Children.Title class="h-5 animate-pulse rounded bg-grey-300" />
			<Children.CallToAction class="h-3 w-10 animate-pulse justify-self-end rounded bg-grey-300" />
		</PromoShow>
	{/each}
</div>

<style lang="postcss">
	.item-show-grid {
		grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
	}
</style>
