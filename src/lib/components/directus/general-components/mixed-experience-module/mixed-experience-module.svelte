<script lang="ts">
	import { page } from '$app/stores';
	import { PromoShow } from '$lib/components/ui/cards/promo-show';
	import KeyboardArrowRight from '$lib/components/ui/icon/keyboard-arrow-right.svelte';
	import { Button, buttonVariants } from '$ui/components/button';
	import { Checkbox } from '$ui/components/checkbox';
	import { Select } from '$ui/components/select';
	import { Regular } from '$ui/components/icon';
	import { Slider } from '$ui/components/slider';
	import { RadioGroup, RadioItem } from '$ui/components/radio';
	import { Modal } from '$ui/components/modal';
	import type { PathSchema } from '$lib/domain/pages';
	import type { StopoverMixedExperienceModuleSchema } from '$lib/directus/stopover_mixed_experience_module';
	import { getPathRecursive } from '$lib/i18n/cannonicals';
	import { isNotNil, map, replace } from 'ramda';
	import { getDirectusImage } from '../../stopover/utils';
	import {
		applyFilters,
		applySourceCaps,
		emptyFilterState,
		getLanguageDisplayName,
		normalizeMixedItem,
		pickTranslation,
		sortItems,
		type MixedFilterState,
		type NormalizedMixedItem,
		type RawMixedItem,
		type SortDir,
		type SortOption
	} from './utils';

	type MixedModuleTranslation = {
		languages_code?: string | null;
		title?: string | null;
		description?: string | null;
		primary_cta_label?: string | null;
		primary_cta_url?: string | null;
		secondary_cta_label?: string | null;
		secondary_cta_url?: string | null;
		reference_point_label?: string | null;
		filter_language_label?: string | null;
		filter_category_label?: string | null;
		filter_discount_label?: string | null;
		filter_duration_label?: string | null;
		filter_distance_label?: string | null;
		filter_apply_label?: string | null;
	};

	type MixedQueryEntry = {
		collection?: string | null;
		items?: RawMixedItem[];
	};

	type MixedSourceTranslation = {
		languages_code?: string | null;
		label?: string | null;
	};

	type MixedSource = {
		id?: number;
		entity_type?: string | null;
		max_items?: number | null;
		status?: string | null;
		translations?: MixedSourceTranslation[] | null;
	};

	export let item: StopoverMixedExperienceModuleSchema | null = null;

	const locale = $page.data.locale || 'en';
	const mixedItemsQueryOutput = $page.data.mixed_items_query_output;

	// ---------------------------------------------------------------------------
	// Read module config (translations, sources with labels, filter_*_enabled)
	// ---------------------------------------------------------------------------
	const moduleConfigFromQuery: StopoverMixedExperienceModuleSchema | null = Array.isArray(
		$page.data.mixed_experience_module_query
	)
		? (($page.data.mixed_experience_module_query as StopoverMixedExperienceModuleSchema[])?.[0] ??
			null)
		: null;
	const moduleConfig: StopoverMixedExperienceModuleSchema | null = item ?? moduleConfigFromQuery;

	// pickTranslation matches the user's active locale (with 'en' fallback and
	// final fallback to translations[0]) instead of blindly taking translations[0].
	const moduleTranslation: MixedModuleTranslation | null =
		pickTranslation(
			moduleConfig?.translations as MixedModuleTranslation[] | null | undefined,
			locale
		) ?? null;

	const moduleSources: MixedSource[] = Array.isArray(moduleConfig?.sources)
		? (moduleConfig!.sources as MixedSource[])
		: [];

	// ---------------------------------------------------------------------------
	// Entity type label lookup (from sources.translations[lang].label, with
	// fallback to hardcoded values for backwards compatibility)
	// ---------------------------------------------------------------------------
	const fallbackLabels = {
		en: { tour: 'Tour', activity: 'Activity' },
		es: { tour: 'Tour', activity: 'Actividad' },
		pt: { tour: 'Tour', activity: 'Atividade' }
	};

	function entityTypeMatchesCollection(
		entityType: string | null | undefined,
		collection: string
	): boolean {
		if (!entityType) return false;
		const et = entityType.toLowerCase();
		const col = collection.toLowerCase();
		if (et === col) return true;
		if (col === 'stopover_tour' && (et === 'stopover_tours' || et === 'tour' || et === 'tours'))
			return true;
		if (
			col === 'stopover_place_to_visit' &&
			(et === 'stopover_places_to_visit' ||
				et === 'stopover_activity' ||
				et === 'stopover_activities' ||
				et === 'activity' ||
				et === 'activities')
		)
			return true;
		return false;
	}

	function getEntityTypeLabel(collection: string | null | undefined): string {
		if (!collection) return '';
		const matchedSource = moduleSources.find((source) =>
			entityTypeMatchesCollection(source.entity_type, collection)
		);
		const cmsLabel = pickTranslation(matchedSource?.translations ?? [], locale)?.label;
		if (cmsLabel) return cmsLabel;
		const localizedLabels =
			fallbackLabels[locale as keyof typeof fallbackLabels] || fallbackLabels.en;
		const normalized = collection.toLowerCase();
		if (normalized.includes('tour')) return localizedLabels.tour;
		if (
			normalized.includes('place_to_visit') ||
			normalized.includes('activity') ||
			normalized.includes('activities')
		)
			return localizedLabels.activity;
		return '';
	}

	// ---------------------------------------------------------------------------
	// Normalize the full pool of items
	// ---------------------------------------------------------------------------
	const rawPool: RawMixedItem[] = (() => {
		const fromSortedItems: RawMixedItem[] = Array.isArray(mixedItemsQueryOutput?.sorted_items)
			? (mixedItemsQueryOutput.sorted_items as RawMixedItem[])
			: [];
		if (fromSortedItems.length > 0) return fromSortedItems;

		const entries: MixedQueryEntry[] = Array.isArray(mixedItemsQueryOutput?.queries)
			? (mixedItemsQueryOutput.queries as MixedQueryEntry[])
			: [];
		return entries.flatMap((entry) =>
			Array.isArray(entry?.items)
				? entry.items.map((promo) => ({
						...promo,
						_collection: promo._collection ?? entry.collection ?? null
					}))
				: []
		);
	})();

	const normalizedPool: NormalizedMixedItem[] = rawPool.map(normalizeMixedItem);

	// ---------------------------------------------------------------------------
	// Derive filter facets from the pool (which values to offer in UI)
	// ---------------------------------------------------------------------------
	type LanguageFacet = { code: string; label: string };
	type CategoryFacet = { id: number; label: string };

	const availableLanguages: LanguageFacet[] = (() => {
		const codes = Array.from(new Set(normalizedPool.flatMap((i) => i.supportedLanguages))).sort();
		return codes.map((code) => ({ code, label: getLanguageDisplayName(code, locale) }));
	})();

	const availableCategories: CategoryFacet[] = (() => {
		const byId = new Map<number, string>();
		for (const item of normalizedPool) {
			if (typeof item.experienceCategory !== 'number') continue;
			const existing = byId.get(item.experienceCategory);
			// Prefer a non-empty localized label over a missing one
			if (!existing && item.categoryLabel) {
				byId.set(item.experienceCategory, item.categoryLabel);
			} else if (!byId.has(item.experienceCategory)) {
				byId.set(item.experienceCategory, item.categoryLabel ?? `#${item.experienceCategory}`);
			}
		}
		return Array.from(byId.entries())
			.map(([id, label]) => ({ id, label }))
			.sort((a, b) => a.label.localeCompare(b.label, locale, { sensitivity: 'base' }));
	})();

	// Preset duration and distance options — can be refined later from the CMS.
	const durationPresets: Array<{ label: string; min: number | null; max: number | null }> = [
		{ label: '< 2h', min: null, max: 2 },
		{ label: '2–4h', min: 2, max: 4 },
		{ label: '4–8h', min: 4, max: 8 },
		{ label: '> 8h', min: 8, max: null }
	];
	const distancePresets: number[] = [1, 3, 5, 10, 20];

	// ---------------------------------------------------------------------------
	// Filter toggles from the module
	// ---------------------------------------------------------------------------
	const filterToggles = {
		language: moduleConfig?.filter_language_enabled ?? true,
		category: moduleConfig?.filter_category_enabled ?? true,
		discount: moduleConfig?.filter_discount_enabled ?? true,
		duration: moduleConfig?.filter_duration_enabled ?? true,
		distance: moduleConfig?.filter_distance_enabled ?? true
	};

	// Only render filter UI if at least one filter is enabled AND has facets worth showing.
	const hasAnyFilter =
		(filterToggles.language && availableLanguages.length > 0) ||
		(filterToggles.category && availableCategories.length > 0) ||
		filterToggles.discount ||
		filterToggles.duration ||
		filterToggles.distance;

	// ---------------------------------------------------------------------------
	// Filter labels
	//
	// Labels marked [CMS] are sourced from the module's translation row matching
	// the current locale (stopover_mixed_experience_module_translations). Edit
	// them directly in the CMS under the module's "Translations" tab.
	//
	// Labels marked [HARDCODED] have no corresponding field in the CMS schema
	// yet; they fall back to the locale-keyed table below. To make them CMS-
	// editable, add the field to stopover_mixed_experience_module_translations
	// via the Directus API (see .ai/scripts/add-translation-fields.ps1 as
	// reference), add it to stopoverMixedExperienceTranslationSchema and
	// stopoverMixedExperienceModuleQueryFields in
	// src/lib/directus/stopover_mixed_experience_module.ts, and wire it in the
	// filterLabels object below.
	// ---------------------------------------------------------------------------
	const defaultFilterLabels = {
		en: {
			filters: 'Filters',
			language: 'Language',
			category: 'Category',
			discount: 'Discount',
			duration: 'Duration',
			distance: 'Distance',
			apply: 'Apply',
			reset: 'Reset',
			referencePoint: '',
			sort: 'Sort by',
			sortDir: 'Order',
			sortAsc: 'Ascending',
			sortDesc: 'Descending',
			anyDuration: 'Any',
			anyDistance: 'Any'
		},
		es: {
			filters: 'Filtros',
			language: 'Idioma',
			category: 'Categoría',
			discount: 'Descuento',
			duration: 'Duración',
			distance: 'Distancia',
			apply: 'Aplicar',
			reset: 'Limpiar',
			referencePoint: '',
			sort: 'Ordenar por',
			sortDir: 'Orden',
			sortAsc: 'Ascendente',
			sortDesc: 'Descendente',
			anyDuration: 'Cualquiera',
			anyDistance: 'Cualquiera'
		},
		pt: {
			filters: 'Filtros',
			language: 'Idioma',
			category: 'Categoria',
			discount: 'Desconto',
			duration: 'Duração',
			distance: 'Distância',
			apply: 'Aplicar',
			reset: 'Limpar',
			referencePoint: '',
			sort: 'Ordenar por',
			sortDir: 'Ordem',
			sortAsc: 'Crescente',
			sortDesc: 'Decrescente',
			anyDuration: 'Qualquer',
			anyDistance: 'Qualquer'
		}
	};
	const fallbackFilterLabels =
		defaultFilterLabels[locale as keyof typeof defaultFilterLabels] || defaultFilterLabels.en;

	const filterLabels = {
		filters: fallbackFilterLabels.filters,                                          // [HARDCODED]
		language: moduleTranslation?.filter_language_label || fallbackFilterLabels.language,   // [CMS] filter_language_label
		category: moduleTranslation?.filter_category_label || fallbackFilterLabels.category,   // [CMS] filter_category_label
		discount: moduleTranslation?.filter_discount_label || fallbackFilterLabels.discount,   // [CMS] filter_discount_label
		duration: moduleTranslation?.filter_duration_label || fallbackFilterLabels.duration,   // [CMS] filter_duration_label
		distance: moduleTranslation?.filter_distance_label || fallbackFilterLabels.distance,   // [CMS] filter_distance_label
		apply: moduleTranslation?.filter_apply_label || fallbackFilterLabels.apply,            // [CMS] filter_apply_label
		reset: fallbackFilterLabels.reset,                                              // [HARDCODED]
		referencePoint: moduleTranslation?.reference_point_label || '',                 // [CMS] reference_point_label
		sort: fallbackFilterLabels.sort,                                                // [HARDCODED]
		sortDir: fallbackFilterLabels.sortDir,                                          // [HARDCODED]
		sortAsc: fallbackFilterLabels.sortAsc,                                          // [HARDCODED]
		sortDesc: fallbackFilterLabels.sortDesc,                                        // [HARDCODED]
		anyDuration: fallbackFilterLabels.anyDuration,                                  // [HARDCODED]
		anyDistance: fallbackFilterLabels.anyDistance                                   // [HARDCODED]
	};

	const sortOptionLabels: Record<SortOption, string> = {
		relevance: locale === 'es' ? 'Relevancia' : locale === 'pt' ? 'Relevância' : 'Relevance',
		discount_percent: filterLabels.discount,
		distance_from_center: filterLabels.distance,
		duration: filterLabels.duration,
		name: locale === 'es' ? 'Nombre' : locale === 'pt' ? 'Nome' : 'Name'
	};
	const sortOptionOrder: SortOption[] = [
		'relevance',
		'discount_percent',
		'distance_from_center',
		'duration',
		'name'
	];
	const sortSelectOptions = sortOptionOrder.map((opt) => ({
		value: opt,
		label: sortOptionLabels[opt]
	}));

	// ---------------------------------------------------------------------------
	// Pending → applied filter state pattern (no server hits on change)
	// ---------------------------------------------------------------------------
	let pendingFilters: MixedFilterState = emptyFilterState();
	let activeFilters: MixedFilterState = emptyFilterState();
	let pendingSort: SortOption = 'relevance';
	let activeSort: SortOption = 'relevance';
	let pendingSortDir: SortDir = 'desc';
	let activeSortDir: SortDir = 'desc';
	let pendingDurationPreset: string | null = null;
	let pendingDistancePreset: number | null = null;
	let modalOpen = false;
	let discountSliderValue: number = 0;
	let durationRadioValue: string = 'any';
	let distanceRadioValue: string = 'any';

	function applyAll() {
		activeFilters = { ...pendingFilters };
		activeSort = pendingSort;
		activeSortDir = pendingSortDir;
		modalOpen = false;
	}

	function resetAll() {
		pendingFilters = emptyFilterState();
		pendingSort = 'relevance';
		pendingSortDir = 'desc';
		pendingDurationPreset = null;
		durationRadioValue = 'any';
		pendingDistancePreset = null;
		distanceRadioValue = 'any';
		discountSliderValue = 0;
		activeFilters = emptyFilterState();
		activeSort = 'relevance';
		activeSortDir = 'desc';
	}

	function toggleLanguage(code: string) {
		pendingFilters = {
			...pendingFilters,
			languages: pendingFilters.languages.includes(code)
				? pendingFilters.languages.filter((c) => c !== code)
				: [...pendingFilters.languages, code]
		};
	}

	function toggleCategory(id: number) {
		pendingFilters = {
			...pendingFilters,
			categories: pendingFilters.categories.includes(id)
				? pendingFilters.categories.filter((c) => c !== id)
				: [...pendingFilters.categories, id]
		};
	}

	// Discount slider → pendingFilters (0 = no filter)
	$: {
		const next = discountSliderValue > 0 ? discountSliderValue : null;
		if (next !== pendingFilters.discountMin) {
			pendingFilters = { ...pendingFilters, discountMin: next };
		}
	}

	// Duration radio → pendingFilters
	$: {
		const expectedPreset = durationRadioValue === 'any' ? null : durationRadioValue;
		if (expectedPreset !== pendingDurationPreset) {
			pendingDurationPreset = expectedPreset;
			const match =
				expectedPreset === null
					? null
					: durationPresets.find((p) => p.label === durationRadioValue);
			pendingFilters = {
				...pendingFilters,
				durationMin: match?.min ?? null,
				durationMax: match?.max ?? null
			};
		}
	}

	// Distance radio → pendingFilters
	$: {
		const km = distanceRadioValue === 'any' ? null : Number(distanceRadioValue);
		const validKm = km !== null && !Number.isNaN(km) ? km : null;
		if (validKm !== pendingDistancePreset) {
			pendingDistancePreset = validKm;
			pendingFilters = { ...pendingFilters, distanceMaxKm: validKm };
		}
	}
	function countActive(filters: MixedFilterState): number {
		let n = 0;
		if (filters.languages.length > 0) n++;
		if (filters.categories.length > 0) n++;
		if (filters.discountMin != null) n++;
		if (filters.durationMin != null || filters.durationMax != null) n++;
		if (filters.distanceMaxKm != null) n++;
		return n;
	}

	// ---------------------------------------------------------------------------
	// Reactive pipeline: filter → sort → source caps → global cap
	// ---------------------------------------------------------------------------
	$: activeFilterCount = countActive(activeFilters);
	$: totalActiveCount = activeFilterCount + (activeSort !== 'relevance' ? 1 : 0);
	$: filteredItems = applyFilters(normalizedPool, activeFilters);
	$: sortedItems = sortItems(filteredItems, activeSort, activeSortDir);

	$: sourceCaps = (() => {
		const caps: Record<string, number | null> = {};
		for (const source of moduleSources) {
			const cap = source.max_items;
			if (source.entity_type) {
				if (source.entity_type === 'stopover_tours' || source.entity_type === 'stopover_tour') {
					caps['stopover_tour'] = cap ?? null;
				} else if (
					source.entity_type === 'stopover_place_to_visit' ||
					source.entity_type === 'stopover_places_to_visit' ||
					source.entity_type === 'stopover_activity' ||
					source.entity_type === 'stopover_activities'
				) {
					caps['stopover_place_to_visit'] = cap ?? null;
				} else {
					caps[source.entity_type] = cap ?? null;
				}
			}
		}
		return caps;
	})();
	$: cappedBySource = applySourceCaps(sortedItems, sourceCaps);
	$: globalCap =
		typeof moduleConfig?.max_items === 'number' && moduleConfig.max_items > 0
			? moduleConfig.max_items
			: cappedBySource.length;
	$: displayedItems = cappedBySource.slice(0, globalCap);

	// ---------------------------------------------------------------------------
	// CTA / site settings
	// ---------------------------------------------------------------------------
	const cta =
		$page.data.siteSettings.translations?.[0]?.labels?.filter((v) => v.name === 'view-more')?.[0] ||
		'Add view more label';
	const ctaText = typeof cta === 'string' ? cta : cta.value;

	const modulePrimaryCtaLabel = moduleTranslation?.primary_cta_label || '';
	const modulePrimaryCtaUrl = moduleTranslation?.primary_cta_url || '';
	const moduleSecondaryCtaLabel = moduleTranslation?.secondary_cta_label || '';
	const moduleSecondaryCtaUrl = moduleTranslation?.secondary_cta_url || '';

	function calculatePath(schema: PathSchema) {
		const path = map(replace(/\/\//g, '/'), getPathRecursive(schema));
		return (path as unknown as Record<string, string>)[$page.data.locale] || '';
	}
</script>

<div data-items-count={displayedItems.length}>
	{#if hasAnyFilter && normalizedPool.length > 0}
		<div class="mb-4 mt-4 flex justify-end py-1">
			<div class="flex items-center gap-2">
				<button
					type="button"
					class={buttonVariants({ variant: 'outline-primary-main', size: 'slim' })}
					onclick={() => (modalOpen = true)}
				>
					<Regular.Filter class="size-4 shrink-0" />
					{filterLabels.filters}
					{#if totalActiveCount > 0}
						<span
							class="inline-flex size-5 items-center justify-center rounded-full bg-primary text-d3 text-common-white"
						>
							{totalActiveCount}
						</span>
					{/if}
				</button>
				<span class="text-d1 text-grey-600">
					{displayedItems.length} / {normalizedPool.length}
				</span>
			</div>
		</div>

		<Modal
			bind:open={modalOpen}
			title={filterLabels.filters}
			titleSize="16px"
			size="narrow"
			mainActionLabel={filterLabels.apply}
			secondaryActionLabel={filterLabels.reset}
			onMainAction={applyAll}
			onSecondaryAction={resetAll}
		>
			<div class="flex flex-col gap-6">
				<!-- Sort section -->
				<div>
					<p class="mb-2 text-d1 font-medium text-grey-700">{filterLabels.sort}</p>
					<div class="flex items-stretch gap-2">
					<div class="flex-1">
						<Select
							label=""
							bind:value={pendingSort}
							options={sortSelectOptions}
							onValueChange={(val) => {
								pendingSort = val as SortOption;
							}}
						/>
					</div>
					{#if pendingSort !== 'relevance'}
						<button
							type="button"
							class="my-2 flex w-10 items-center justify-center rounded border border-grey-300 text-grey-700 hover:border-primary"
							title="{filterLabels.sortDir}: {pendingSortDir === 'asc'
								? filterLabels.sortAsc
								: filterLabels.sortDesc}"
							aria-label={filterLabels.sortDir}
							onclick={() => {
								pendingSortDir = pendingSortDir === 'asc' ? 'desc' : 'asc';
							}}
						>
							<span
								class="transition-transform duration-200"
								style={pendingSortDir === 'asc' ? 'transform: scaleY(-1)' : ''}
							>
								<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" aria-hidden="true" class="fill-current">
									<path d="M4 18q-.425 0-.712-.288T3 17t.288-.712T4 16h4q.425 0 .713.288T9 17t-.288.713T8 18zm0-5q-.425 0-.712-.288T3 12t.288-.712T4 11h10q.425 0 .713.288T15 12t-.288.713T14 13zm0-5q-.425 0-.712-.288T3 7t.288-.712T4 6h16q.425 0 .713.288T21 7t-.288.713T20 8z"/>
								</svg>
							</span>
						</button>
					{/if}
				</div>
				</div>

				<!-- Language (multi-select → checkboxes, horizontal wrap) -->
				{#if filterToggles.language && availableLanguages.length > 0}
					<fieldset class="flex flex-col gap-2">
						<legend class="mb-1 text-d1 font-medium text-grey-700">
							{filterLabels.language}
						</legend>
						<div class="flex flex-wrap gap-x-4 gap-y-2">
							{#each availableLanguages as lang (lang.code)}
								<label class="flex cursor-pointer items-center gap-2 text-b text-grey-700">
									<Checkbox
										checked={pendingFilters.languages.includes(lang.code)}
										onCheckedChange={() => toggleLanguage(lang.code)}
									/>
									<span>{lang.label}</span>
								</label>
							{/each}
						</div>
					</fieldset>
				{/if}

			<!-- Category (multi-select listbox with checkboxes) -->
			{#if filterToggles.category && availableCategories.length > 0}
				<fieldset class="flex flex-col gap-2">
					<legend class="mb-1 text-d1 font-medium text-grey-700">
						{filterLabels.category}
					</legend>
					<div
						role="listbox"
						aria-multiselectable="true"
						aria-label={filterLabels.category}
						class="max-h-44 overflow-y-auto rounded-lg border border-grey-300 bg-common-white"
					>
						{#each availableCategories as cat (cat.id)}
							{@const isChecked = pendingFilters.categories.includes(cat.id)}
							<label
								class="flex cursor-pointer select-none items-center gap-3 px-3 py-2.5 transition-colors hover:bg-background-lightblue {isChecked ? 'bg-background-lightblue' : ''}"
							>
								<Checkbox
									checked={isChecked}
									onCheckedChange={() => toggleCategory(cat.id)}
								/>
								<span class="text-b text-grey-700">{cat.label}</span>
							</label>
						{/each}
					</div>
					{#if pendingFilters.categories.length > 0}
						<p class="text-d3 text-grey-500">
							{pendingFilters.categories.length}
							{pendingFilters.categories.length === 1 ? 'seleccionada' : 'seleccionadas'}
						</p>
					{/if}
				</fieldset>
			{/if}

			<!-- Discount (slider, step 5) -->
				{#if filterToggles.discount}
					<fieldset class="flex flex-col gap-2">
						<legend class="text-d1 font-medium text-grey-700">
							{filterLabels.discount}
							<span class="ml-1 font-normal text-grey-500">
								{discountSliderValue > 0
									? `\u2265 ${discountSliderValue}%`
									: `(${filterLabels.anyDuration})`}
							</span>
						</legend>
						<div class="pb-6 pt-4">
							<Slider
								bind:value={discountSliderValue}
								min={0}
								max={100}
								step={5}
								showTooltip={true}
								formatTooltip={(v) => (v === 0 ? '\u2014' : `\u2265 ${v}%`)}
							/>
						</div>
						<div class="flex justify-between text-d3 text-grey-500">
							<span>0%</span>
							<span>100%</span>
						</div>
					</fieldset>
				{/if}

				<!-- Duration (single-select → radio, horizontal wrap) -->
				{#if filterToggles.duration}
					<fieldset class="flex flex-col gap-2">
						<legend class="mb-1 text-d1 font-medium text-grey-700">
							{filterLabels.duration}
						</legend>
						<RadioGroup
							bind:value={durationRadioValue}
							class="flex-row flex-wrap gap-x-4 gap-y-2"
						>
							<RadioItem value="any" label={filterLabels.anyDuration} />
							{#each durationPresets as preset (preset.label)}
								<RadioItem value={preset.label} label={preset.label} />
							{/each}
						</RadioGroup>
					</fieldset>
				{/if}

				<!-- Distance (single-select → radio, horizontal wrap) -->
				{#if filterToggles.distance}
					<fieldset class="flex flex-col gap-2">
						<legend class="mb-1 text-d1 font-medium text-grey-700">
							{filterLabels.distance}
						</legend>
						<RadioGroup
							bind:value={distanceRadioValue}
							class="flex-row flex-wrap gap-x-4 gap-y-2"
						>
							<RadioItem value="any" label={filterLabels.anyDistance} />
							{#each distancePresets as km (km)}
								<RadioItem value={String(km)} label={`\u2264 ${km} km`} />
							{/each}
						</RadioGroup>
						{#if filterLabels.referencePoint}
							<p class="text-d3 text-grey-600">{filterLabels.referencePoint}</p>
						{/if}
					</fieldset>
				{/if}
			</div>
		</Modal>
	{/if}

	{#if normalizedPool.length === 0}
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
			{#each displayedItems as normalized (normalized.stableKey)}
				{@const promo = normalized.raw}
				{@const entityTypeLabel = getEntityTypeLabel(normalized.collection)}
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
								<div
									class="col-start-2 row-start-2 mb-2 inline-flex items-end justify-self-end gap-1 md:gap-2"
								>
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
