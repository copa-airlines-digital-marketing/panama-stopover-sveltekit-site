<script lang="ts">
	import { page } from '$app/stores';
	import { PromoShow } from '$lib/components/ui/cards/promo-show';
	import KeyboardArrowRight from '$lib/components/ui/icon/keyboard-arrow-right.svelte';
	import { Button } from '$ui/components/button';
	import type { PathSchema } from '$lib/domain/pages';
	import type { StopoverMixedExperienceModuleSchema } from '$lib/directus/stopover_mixed_experience_module';
	import { getPathRecursive } from '$lib/i18n/cannonicals';
	import { isNil, isNotNil, map, replace } from 'ramda';
	import { getDirectusImage } from '../../stopover/utils';

	type MixedPromoItem = {
		priority?: number | null;
		date_created?: string | null;
		main_image?: string | null;
		promo_discount_percent?: number | null;
		promo_discount_amount?: number | null;
		_collection?: string | null;
		translations?: Array<{
			name?: string | null;
			path?: string | null;
			promo_name?: string | null;
		}>;
		parent_page?: PathSchema | null;
	};

	type MixedModuleTranslation = {
		primary_cta_label?: string | null;
		primary_cta_url?: string | null;
		secondary_cta_label?: string | null;
		secondary_cta_url?: string | null;
	};

	type MixedQueryEntry = {
		collection?: string | null;
		items?: MixedPromoItem[];
	};

	export let item: StopoverMixedExperienceModuleSchema | null = null;

	const mixedItemsQueryOutput = $page.data.mixed_items_query_output;
	const sortedItemsFromQuery: MixedPromoItem[] = Array.isArray(mixedItemsQueryOutput?.sorted_items)
		? (mixedItemsQueryOutput.sorted_items as MixedPromoItem[])
		: [];
	const itemsQueryEntries: MixedQueryEntry[] = Array.isArray(mixedItemsQueryOutput?.queries)
		? (mixedItemsQueryOutput.queries as MixedQueryEntry[])
		: [];

	const moduleItems: MixedPromoItem[] =
		sortedItemsFromQuery.length > 0
			? sortedItemsFromQuery
			: itemsQueryEntries.flatMap((entry) =>
					Array.isArray(entry?.items)
						? entry.items.map((promo) => ({
								...promo,
								_collection: promo._collection ?? entry.collection ?? null
							}))
						: []
				);

	const moduleTranslation: MixedModuleTranslation | null =
		(item?.translations?.[0] as MixedModuleTranslation | undefined) ??
		(Array.isArray($page.data.mixed_experience_module_query)
			? (($page.data.mixed_experience_module_query?.[0]?.translations?.[0] as
					| MixedModuleTranslation
					| undefined) ?? null)
			: null);

	const cta =
		$page.data.siteSettings.translations?.[0]?.labels?.filter((v) => v.name === 'view-more')?.[0] ||
		'Add view more label';
	const ctaText = typeof cta === 'string' ? cta : cta.value;
	const locale = $page.data.locale || 'en';

	const modulePrimaryCtaLabel = moduleTranslation?.primary_cta_label || '';
	const modulePrimaryCtaUrl = moduleTranslation?.primary_cta_url || '';
	const moduleSecondaryCtaLabel = moduleTranslation?.secondary_cta_label || '';
	const moduleSecondaryCtaUrl = moduleTranslation?.secondary_cta_url || '';

	function calculatePath(schema: PathSchema) {
		const path = map(replace(/\/\//g, '/'), getPathRecursive(schema));
		return (path as unknown as Record<string, string>)[$page.data.locale] || '';
	}

	function getEntityTypeLabel(collection: string | null | undefined): string {
		const normalized = (collection || '').toLowerCase();

		const labels = {
			en: { tour: 'Tour', activity: 'Activity' },
			es: { tour: 'Tour', activity: 'Actividad' },
			pt: { tour: 'Tour', activity: 'Atividade' }
		};

		const localizedLabels = labels[locale as keyof typeof labels] || labels.en;

		if (normalized.includes('tour')) return localizedLabels.tour;
		if (
			normalized.includes('place_to_visit') ||
			normalized.includes('activity') ||
			normalized.includes('activities')
		)
			return localizedLabels.activity;

		return '';
	}
</script>

<div data-items-count={item?.items?.length ?? moduleItems.length}>
	{#if isNil(moduleItems) || moduleItems.length === 0}
		<div
			class="my-6 grid grid-cols-[repeat(auto-fit,minmax(140px,1fr))] items-stretch gap-2 md:grid-cols-[repeat(auto-fit,minmax(320px,1fr))] md:gap-4"
		>
			{#each new Array(4) as skeli, idx (idx)}
				<PromoShow let:Children data-skeleton={skeli}>
					<Children.Image class="aspect-video bg-grey-100" />
					<Children.Discount class="h-4 w-10 animate-pulse justify-self-end bg-grey-300" />
					<Children.Title class="h-5 animate-pulse rounded-sm bg-grey-300" />
					<Children.CallToAction
						class="h-3 w-10 animate-pulse justify-self-end rounded-sm bg-grey-300"
					/>
				</PromoShow>
			{/each}
		</div>
	{:else}
		<ul
			class="my-6 grid grid-cols-[repeat(auto-fit,minmax(140px,1fr))] items-stretch gap-2 md:grid-cols-[repeat(auto-fill,minmax(320px,1fr))] md:gap-4"
		>
			{#each moduleItems as promo}
				{@const entityTypeLabel = getEntityTypeLabel(promo._collection)}
				{#if promo.parent_page && promo.translations?.[0]?.path && promo.main_image}
					<li class="max-w-[398px]">
						<PromoShow
							let:Children
							href={`${calculatePath(promo.parent_page)}/${promo.translations?.[0]?.path || ''}`}
						>
							<Children.Image>
								<img
									src="{getDirectusImage(promo.main_image)}?key=2-1x600"
									alt=""
									class="h-auto w-full"
								/>
							</Children.Image>
							{#if promo.promo_discount_percent || promo.promo_discount_amount}
								<div class="col-start-2 row-start-2 mb-2 inline-flex items-end justify-self-end gap-1 md:gap-2">
									{#if entityTypeLabel}
										<Children.Discount class="mb-0 bg-secondary text-grey-50">
											{entityTypeLabel}
										</Children.Discount>
									{/if}
									<Children.Discount class="mb-0">
										-{promo.promo_discount_percent ||
											Math.round(promo.promo_discount_amount || 0)}{promo.promo_discount_percent
											? '%'
											: ' USD'}
									</Children.Discount>
								</div>
							{/if}
							<Children.Title>
								{promo.translations?.[0]?.name}
							</Children.Title>
							{#if isNotNil(promo.translations?.[0]?.promo_name)}
								<Children.Name>{promo.translations?.[0]?.promo_name}</Children.Name>
							{/if}
							<Children.CallToAction>
								{ctaText}
								<KeyboardArrowRight class="size-3 fill-current md:size-4" />
							</Children.CallToAction>
						</PromoShow>
					</li>
				{/if}
			{/each}
		</ul>

		{#if (modulePrimaryCtaLabel && modulePrimaryCtaUrl) || (moduleSecondaryCtaLabel && moduleSecondaryCtaUrl)}
			<div class="mb-6 flex w-full flex-wrap items-center justify-center gap-3 md:gap-4">
				{#if modulePrimaryCtaLabel && modulePrimaryCtaUrl}
					<Button href={modulePrimaryCtaUrl}>
						{modulePrimaryCtaLabel}
						<KeyboardArrowRight class="size-3 fill-current md:size-4" />
					</Button>
				{/if}

				{#if moduleSecondaryCtaLabel && moduleSecondaryCtaUrl}
					<Button href={moduleSecondaryCtaUrl} variant="outline-primary-main">
						{moduleSecondaryCtaLabel}
						<KeyboardArrowRight class="size-3 fill-current md:size-4" />
					</Button>
				{/if}
			</div>
		{/if}
	{/if}
</div>
