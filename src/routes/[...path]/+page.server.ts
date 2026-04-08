import { getPageData } from '$lib/data/page.js';
import type { HotelSchema } from '$lib/domain/hotels';
import { isNotFoundSchema } from '$lib/directus/not-found.js';
import { isPageSettings, type PageSchema } from '$lib/domain/pages';
import type { PlaceSchema } from '$lib/domain/places';
import type { RestaurantSchema } from '$lib/domain/restaurants';
import type { SectionSchema } from '$lib/directus/section.js';
import { say } from '$lib/utils.js';
import { error } from '@sveltejs/kit';
import { getAllSectionModules, getModuleRequest, setToValue } from '../utils';
import { isEmpty, isNil } from 'ramda';
import type { EntryGenerator } from '../$types';
import { getAllPagesParams } from '$lib/data/pages';
import { getItems } from '$lib/infrastructure/directus/utils';
import { pagePathFields } from '$lib/domain/pages';

type DataTypeMap = {
	page: PageSchema | undefined;
	pageSections: SectionSchema[] | undefined;
	stopover_hotels: HotelSchema | undefined;
	stopover_restaurants: RestaurantSchema | undefined;
	stopover_place_to_visit: PlaceSchema | undefined;
	mixed_experience_module_query: unknown;
	mixed_items_query_output: unknown;
	modules_config_list: unknown[];
};

const targetModuleCollections = [
	'stopover_hotel_module',
	'stopover_mixed_experience_module',
	'stopover_mixed_experiece_module'
] as const;

const isRecord = (value: unknown): value is Record<string, unknown> =>
	typeof value === 'object' && value !== null;

const isTargetModuleCollection = (value: unknown): value is (typeof targetModuleCollections)[number] =>
	typeof value === 'string' && targetModuleCollections.some((collection) => collection === value);

const getModulesConfigList = (sections: SectionSchema[] | undefined) => {
	if (!sections) return [];

	const result: unknown[] = [];

	sections.forEach((section) => {
		const sectionItems = section.section_content || [];

		sectionItems.forEach((sectionItem) => {
			if (isTargetModuleCollection(sectionItem.collection)) {
				result.push({
					source: 'section_content',
					section_id: section.id,
					section_content_id: sectionItem.id,
					collection: sectionItem.collection,
					item: sectionItem.item
				});
				return;
			}

			if (sectionItem.collection !== 'content_group' || !isRecord(sectionItem.item)) return;

			const content = sectionItem.item['content'];

			if (!Array.isArray(content)) return;

			content.forEach((contentItem, contentIndex) => {
				if (!isRecord(contentItem) || !isTargetModuleCollection(contentItem.collection)) return;

				result.push({
					source: 'content_group',
					section_id: section.id,
					section_content_id: sectionItem.id,
					content_index: contentIndex,
					collection: contentItem.collection,
					item: contentItem.item
				});
			});
		});
	});

	return result;
};

const promoOnlyFilter = {
	_or: [
		{
			promo_discount_amount: {
				_nnull: true
			}
		},
		{
			promo_discount_percent: {
				_nnull: true
			}
		},
		{
			promo_code: {
				_nnull: true
			}
		}
	]
};

type SortablePromoItem = {
	priority?: number | null;
	promo_discount_percent?: number | null;
	date_created?: string | null;
	translations?: Array<{
		name?: string | null;
	}>;
};

const toTimestamp = (value: string | null | undefined) => {
	if (!value) return Number.MAX_SAFE_INTEGER;
	const parsed = Date.parse(value);
	return Number.isNaN(parsed) ? Number.MAX_SAFE_INTEGER : parsed;
};

const comparePromoItems = (a: SortablePromoItem, b: SortablePromoItem) => {
	const byPriority = (b.priority ?? 0) - (a.priority ?? 0);
	if (byPriority !== 0) return byPriority;

	const byDiscountPercent = (b.promo_discount_percent ?? 0) - (a.promo_discount_percent ?? 0);
	if (byDiscountPercent !== 0) return byDiscountPercent;

	// "antiguedad": older items first (earlier creation date).
	const byDate = toTimestamp(a.date_created) - toTimestamp(b.date_created);
	if (byDate !== 0) return byDate;

	const nameA = a.translations?.[0]?.name?.toLocaleLowerCase() ?? '';
	const nameB = b.translations?.[0]?.name?.toLocaleLowerCase() ?? '';
	return nameA.localeCompare(nameB);
};

const sortAndTrimPromoItems = <T extends SortablePromoItem>(items: T[], maxItems: number) =>
	[...items].sort(comparePromoItems).slice(0, maxItems);

const isPromotionPrefilter = (prefilter: string | null | undefined) =>
	(prefilter ?? '').toLocaleLowerCase() === 'promotions';

const buildMixedPromoItemsQuery = (
	locale: string,
	collection: string,
	prefilter: string | null | undefined
) => ({
	fields: [
		'priority',
		'main_image',
		'promo_discount_percent',
		'promo_discount_amount',
		{ translations: ['name', 'path', 'promo_name'] },
		{ parent_page: pagePathFields }
	] as any,
	filter: {
		_and: [isPromotionPrefilter(prefilter) ? promoOnlyFilter : undefined].filter(Boolean)
	} as any,
	deep: {
		translations: {
			_filter: getItemTranslationsFilter(collection, locale)
		},
		parent_page: {
			translations: { _filter: { languages_code: { _eq: locale } } },
			parent: {
				translations: { _filter: { languages_code: { _eq: locale } } },
				parent: {
					translations: { _filter: { languages_code: { _eq: locale } } }
				}
			}
		}
	} as any,
	limit: -1
});

const mixedEntityTypeToCollectionMap: Record<string, string> = {
	activities: 'stopover_place_to_visit',
	hotels: 'stopover_hotels',
	restaurants: 'stopover_restaurants',
	tours: 'stopover_tour',
	packages: 'stopover_package',
	transportation: 'stopover_transportation',
	stopover_place_to_visit: 'stopover_place_to_visit',
	stopover_places_to_visit: 'stopover_place_to_visit',
	stopover_activity: 'stopover_place_to_visit',
	stopover_activities: 'stopover_place_to_visit',
	stopover_tours: 'stopover_tour',
	stopover_tour: 'stopover_tour',
	stopover_hotel: 'stopover_hotels',
	stopover_hotels: 'stopover_hotels',
	stopover_restaurant: 'stopover_restaurants',
	stopover_restaurants: 'stopover_restaurants',
	stopover_package: 'stopover_package',
	stopover_packages: 'stopover_package',
	stopover_transport: 'stopover_transportation',
	stopover_transportation: 'stopover_transportation'
};

const getItemTranslationsFilter = (collectionName: string, locale: string) => {
	if (
		[
			'stopover_hotels',
			'stopover_restaurants',
			'stopover_place_to_visit'
		].includes(collectionName)
	) {
		return {
			lang_code: {
				_eq: locale
			}
		};
	}

	return {
		languages_code: {
			_eq: locale
		}
	};
};

export const entries: EntryGenerator = async () => {
	const allPagesParams = await getAllPagesParams();
	console.log(
		`Sveltekit will render ${allPagesParams.length} pages`,
		JSON.stringify(
			allPagesParams.map((v) => v.path),
			null,
			2
		)
	);
	return allPagesParams;
};

export async function load(event) {
	const {
		parent,
		params: { path },
		route
	} = event;

	console.log(`requesting data for page: ${path}`);

	if (!path) {
		say('Path param is required', event);
		return error(404);
	}

	const preview = null;

	const [locale, category, subCategory, article] = path.split('/');

	const [pageData, parentData] = await Promise.all([
		getPageData({ locale, preview, category, subCategory, article, home: category || 'true' }),
		parent()
	]);

	const { page, sections: pageSections } = pageData;

	if (!article && !isPageSettings(page)) {
		say('error ocurred while getting homepage info');
		return error(500);
	}

	if (pageSections) {
		const modulesPaths = getAllSectionModules(pageSections);

		const modulesData = await Promise.allSettled(
			modulesPaths.map(getModuleRequest(pageSections, locale))
		);

		modulesPaths.forEach((path, key) => {
			const settledModule = modulesData[key];
			const items = settledModule.status === 'fulfilled' ? settledModule.value : null;

			if (isNil(items) || isEmpty(items)) return;

			setToValue(pageSections, items, [...path, 'items']);
		});
	}

	const buildMixedConfigQuery = () => ({
		fields: [
			'key',
			'max_items',
			'prefilter',
			{
				translations: [
					'languages_code',
					'title',
					'primary_cta_label',
					'primary_cta_url',
					'secondary_cta_label',
					'secondary_cta_url'
				]
			},
			{
				sources: ['entity_type']
			}
		] as any,
		deep: {
			translations: {
				_filter: {
					languages_code: {
						_eq: locale
					}
				}
			}
		} as any,
		limit: 1
	});

	const mixedFromCanonical = await getItems(
		'stopover_mixed_experience_module',
		buildMixedConfigQuery(),
		null
	).catch(() => null);

	const mixed_experience_module_query =
		Array.isArray(mixedFromCanonical) && !isEmpty(mixedFromCanonical)
			? mixedFromCanonical
			: await getItems('stopover_mixed_experiece_module', buildMixedConfigQuery(), null).catch(
					() => null
				);

	const mixed_items_query_output = await (async () => {
		const moduleConfig = Array.isArray(mixed_experience_module_query)
			? mixed_experience_module_query[0]
			: null;

		if (!moduleConfig || typeof moduleConfig !== 'object') return null;

		const sources = Array.isArray((moduleConfig as Record<string, unknown>).sources)
			? ((moduleConfig as Record<string, unknown>).sources as Array<Record<string, unknown>>)
			: [];
		const prefilter = (moduleConfig as Record<string, unknown>).prefilter;
		const maxItems = (moduleConfig as Record<string, unknown>).max_items;
		const limit = typeof maxItems === 'number' ? maxItems : 6;

		const queries = await Promise.all(
			sources.map(async (source) => {
				const entityType = typeof source.entity_type === 'string' ? source.entity_type : null;
				const collection = entityType ? mixedEntityTypeToCollectionMap[entityType] : null;

				if (!collection) {
					return { entity_type: entityType, collection: null, items: [] };
				}

				const items = await getItems(
					collection as any,
					buildMixedPromoItemsQuery(locale, collection, prefilter as string | null | undefined),
					null
				).catch((error) => ({ __query_error: error }));

				return {
					entity_type: entityType,
					collection,
					items
				};
			})
		);

		const mergedItems = queries
			.filter((entry) => Array.isArray(entry.items))
			.flatMap((entry) =>
				(entry.items as Array<Record<string, unknown>>).map((promo) => ({
					...promo,
					_collection: entry.collection
				}))
			);

		return {
			module_key: (moduleConfig as Record<string, unknown>).key,
			prefilter,
			limit,
			sources,
			queries,
			sorted_items: sortAndTrimPromoItems(mergedItems as SortablePromoItem[], limit)
		};
	})();

	if (isNotFoundSchema(pageData)) {
		say('Page requested not found', route);
		return error(404);
	}

	const finalData: DataTypeMap = {
		page,
		stopover_hotels: undefined,
		stopover_restaurants: undefined,
		stopover_place_to_visit: undefined,
		mixed_experience_module_query,
		mixed_items_query_output,
		modules_config_list: getModulesConfigList(pageSections),
		...pageData,
		pageSections
	};

	console.log(`Processed data for: ${path}, sending it to render`);

	return {
		...parentData,
		...finalData
	};
}

export const trailingSlash = 'always';
export const prerender = true;
