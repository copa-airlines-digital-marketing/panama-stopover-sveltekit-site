<script lang="ts">
	import { SVG } from '$lib/components/ui/icon';
	import type { HotelAmenity } from '$lib/directus/hotel-amenities';
	import type { HotelSchema } from '$lib/directus/hotels';
	import { getTypography } from '$ui/components/typography';
	import { IconList } from '../../ui/icon-list';

	export let item: HotelSchema;
	export let amenites: HotelAmenity[];
	const amenitesToObject = amenites.reduce(
		(a, c) => ({ ...a, [c.name]: c }),
		<Record<string, HotelAmenity>>{}
	);
	const iterateOn = item.includes.map((v) => amenitesToObject[v]);
</script>

{#if iterateOn && Array.isArray(iterateOn)}
	<IconList let:Item>
		{#each iterateOn as value, i}
			<Item>
				<SVG data={value.icon.code} class="size-10 fill-primary"></SVG>
				<span class={getTypography('body', 'body', 'text-center')}
					>{value.translations[0].name}</span
				>
			</Item>
		{/each}
	</IconList>
{:else}
	{`There are no amenities`}
{/if}
