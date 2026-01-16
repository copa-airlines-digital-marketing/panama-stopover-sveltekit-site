<script lang="ts">
	import { page } from '$app/stores';
	import { getPageCannonicals } from '$lib/components/directus/context';
	import { Button } from '$ui/components/button';
	import { KeyBoardArrowRight } from '$lib/components/ui/icon';
	import { Breadcrum } from '$lib/components/ui/breadcrum';
	import type { HotelSchema } from '$lib/domain/hotels';
	import type { PageSchema } from '$lib/domain/pages';
	import type { PlaceSchema } from '$lib/domain/places';
	import type { RestaurantSchema } from '$lib/domain/restaurants';
	import { getBreadcrumNames } from '$lib/i18n/cannonicals';
	import { cn } from '$lib/utils';
	import { isNotEmpty, mapAccum } from 'ramda';
	import type { TourSchema } from '$lib/domain/tours';
	import type { PackageSchema } from '$lib/domain/packages';
	import type { TransportationSchema } from '$lib/domain/transportation';

	export let item:
		| PageSchema
		| HotelSchema
		| RestaurantSchema
		| PlaceSchema
		| TourSchema
		| PackageSchema
		| TransportationSchema;

	export let variant: 'primary' | 'invert' = 'primary';

	$: locale = $page.data.locale;

	let cannonicals = getPageCannonicals();

	const appender = (a: string, b: string) => [`${a}/${b}`, `${a}/${b}`];

	$: [, breadcrumLinks] =
		$cannonicals && mapAccum(appender, '', $cannonicals[locale].split('/').filter(isNotEmpty));

	$: breadcrumNames = locale && item && getBreadcrumNames(item)[locale].split('/').slice(1);
</script>

{#if Array.isArray(breadcrumLinks) && isNotEmpty(breadcrumLinks) && Array.isArray(breadcrumNames) && isNotEmpty(breadcrumNames) && breadcrumLinks.length > 1}
	<Breadcrum let:List class="mb-6 md:mt-6">
		<List let:Item>
			{#each breadcrumLinks as bclink, i}
				{#if i > 0}
					<Item let:Separator>
						<Separator>
							<KeyBoardArrowRight
								class={cn('size-4 fill-grey-400 lg:size-6', {
									'fill-green-100': variant === 'invert'
								})}
							/>
						</Separator>
					</Item>
				{/if}
				<Item let:Page>
					{#if i === breadcrumLinks.length - 1}
						<Page class={cn('my-0', { 'text-grey-50': variant === 'invert' })}>
							{breadcrumNames[i]}
						</Page>
					{:else}
						<Button
							href={bclink}
							size="link"
							variant={variant === 'primary' ? 'link' : 'link-invert'}
						>
							{breadcrumNames[i]}
						</Button>
					{/if}
				</Item>
			{/each}
		</List>
	</Breadcrum>
{/if}
