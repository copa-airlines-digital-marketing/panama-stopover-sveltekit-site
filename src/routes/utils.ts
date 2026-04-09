import { pagePathFields } from '$lib/domain/pages';
import { isContentGroupSchema, type ContentGroupContent } from '$lib/directus/content-group';
import type { SectionContentSchema, SectionSchema } from '$lib/directus/section';
import {
	isStopoverModuleSchema,
	type StopoverHotelModuleSchema
} from '$lib/directus/stopover_hotel_module';
import {
	isStopoverMixedExperienceModuleSchema,
	type StopoverMixedExperienceModuleSchema
} from '$lib/directus/stopover_mixed_experience_module';
import { isEmpty, isNil, isNotNil, pathOr } from 'ramda';
import type { QueryItem } from '@directus/sdk';
import type { Schema } from '$lib/infrastructure/directus/schema';
import { getItems } from '$lib/infrastructure/directus/utils';

type MixedModuleCollection =
	| 'stopover_mixed_experience_module'
	| 'stopover_mixed_experiece_module';

const getMixedModuleCollections = (preferred: MixedModuleCollection): MixedModuleCollection[] => {
	if (preferred === 'stopover_mixed_experience_module') {
		return ['stopover_mixed_experience_module', 'stopover_mixed_experiece_module'];
	}

	return ['stopover_mixed_experiece_module', 'stopover_mixed_experience_module'];
};

const getGroupContentModules =
	(path: string[]) =>
	(result: Array<string[]>, { item, collection }: ContentGroupContent, key: number) => {
		const isHotelCollection = collection === 'stopover_hotel_module';
		const isMixedCollection =
			collection === 'stopover_mixed_experience_module' ||
			collection === 'stopover_mixed_experiece_module';
		if (
			!isStopoverModuleSchema(item) &&
			!isStopoverMixedExperienceModuleSchema(item) &&
			!isMixedCollection &&
			!isHotelCollection
		)
			return result;

		return [...result, [...path, 'content', '' + key, 'item']];
	};

const getSectionContentModules =
	(path: number) =>
	(result: Array<string[]>, { item, collection }: SectionContentSchema, key: number) => {
		const newPath = ['' + path, 'section_content', '' + key, 'item'];
		const isHotelCollection = collection === 'stopover_hotel_module';
		const isMixedCollection =
			collection === 'stopover_mixed_experience_module' ||
			collection === 'stopover_mixed_experiece_module';

		if (
			isStopoverModuleSchema(item) ||
			isStopoverMixedExperienceModuleSchema(item) ||
			isMixedCollection ||
			isHotelCollection
		)
			return [...result, newPath];

		if (!isContentGroupSchema(item)) return result;

		const { content } = item;

		if (isNil(content) || isEmpty(content)) return result;

		const modules = content.reduce(getGroupContentModules(newPath), []);

		return [...result, ...modules];
	};

const getSectionModules = (
	result: Array<string[]>,
	{ section_content }: SectionSchema,
	key: number
) => {
	if (isNil(section_content) || isEmpty(section_content)) return result;

	const modules = section_content.reduce(getSectionContentModules(key), []);

	return [...result, ...modules];
};

const getAllSectionModules = (sections: SectionSchema[]) => sections.reduce(getSectionModules, []);

/** Get modules functions */
const collectionMap: Record<string, keyof Schema> = {
	hotels: 'stopover_hotels',
	hotel: 'stopover_hotels',
	stopover_hotels: 'stopover_hotels',
	stopover_hotel: 'stopover_hotels',
	restaurants: 'stopover_restaurants',
	restaurant: 'stopover_restaurants',
	stopover_restaurants: 'stopover_restaurants',
	stopover_restaurant: 'stopover_restaurants',
	activities: 'stopover_place_to_visit',
	activity: 'stopover_place_to_visit',
	stopover_place_to_visit: 'stopover_place_to_visit',
	stopover_places_to_visit: 'stopover_place_to_visit',
	stopover_activity: 'stopover_place_to_visit',
	stopover_activities: 'stopover_place_to_visit',
	tours: 'stopover_tour',
	tour: 'stopover_tour',
	stopover_tour: 'stopover_tour',
	stopover_tours: 'stopover_tour',
	packages: 'stopover_package',
	package: 'stopover_package',
	stopover_package: 'stopover_package',
	stopover_packages: 'stopover_package',
	transportation: 'stopover_transportation',
	transport: 'stopover_transportation',
	stopover_transportation: 'stopover_transportation',
	stopover_transport: 'stopover_transportation'
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

const getTranslationsFilter = (collectionName: string, locale: string) => {
	if (
		[
			'hotels',
			'restaurants',
			'activities',
			'stopover_hotels',
			'stopover_restaurants',
			'stopover_place_to_visit'
		].includes(collectionName)
	)
		return {
			lang_code: {
				_eq: locale
			}
		};

	return {
		languages_code: {
			_eq: locale
		}
	};
};

const getCollectionOfModule = (collectionName: string) =>
	pathOr(null, [collectionName], collectionMap);

const mixedEntityTypeToCollectionMap: Record<string, keyof Schema> = {
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

const getMixedSourceCollection = (entityType: string) =>
	pathOr(null, [entityType], mixedEntityTypeToCollectionMap);

const buildModuleQuery = (
	{ max_items, highlight_only, sort, promo_only, pilar }: StopoverHotelModuleSchema,
	collectionName: string,
	locale: string
): QueryItem<Schema, 'stopover_hotels'> => ({
	// Hotel-like modules in CMS can omit some flags; normalize defaults here.
	// This keeps module fetching resilient to partial config entries.
	fields: [
		'priority',
		'main_image',
		'promo_discount_percent',
		'promo_discount_amount',
		{ translations: ['name', 'path', 'promo_name'] },
		{ parent_page: pagePathFields }
	] as any,
	filter: {
		_and: [
			(promo_only ?? false) ? promoOnlyFilter : undefined,
			(highlight_only ?? false) ? { highlight: { _eq: true } } : undefined,
			pilar ? { pilar: { _in: pilar } } : undefined
		].filter((v) => isNotNil(v))
	} as any,
	deep: {
		translations: {
			_filter: getTranslationsFilter(collectionName, locale)
		},
		parent_page: {
			translations: { _filter: { languages_code: { _eq: locale } } },
			parent: {
				translations: { _filter: { languages_code: { _eq: locale } } },
				parent: {
					translations: { _filter: { languages_code: { _eq: locale } } },
					parent: {
						translations: { _filter: { languages_code: { _eq: locale } } }
					}
				}
			}
		}
	} as any,
	sort: (sort && sort.map((v) => (v.order === 'asc' ? v.by : '-' + v.by))) || [],
	limit: -1
});

const getMixedModuleDetailsByKey = async (
	moduleCollection: MixedModuleCollection,
	moduleKey: string
) => {
	const collections = getMixedModuleCollections(moduleCollection);

	for (const collection of collections) {
		const response = await getItems(
			collection,
			{
				fields: [
					'key',
					'max_items',
					'prefilter',
					{
						translations: [
							'languages_code',
							'title',
							'description',
							'disclaimer_text',
							'primary_cta_label',
							'primary_cta_url',
							'secondary_cta_label',
							'secondary_cta_url'
						]
					},
					{
						sources: ['entity_type']
					}
				],
				filter: {
					key: {
						_eq: moduleKey
					}
				},
				limit: 1
			} as any,
			null
		);

		if (!Array.isArray(response) || isEmpty(response)) continue;

		const [module] = response as Array<StopoverMixedExperienceModuleSchema>;
		return module;
	}

	return null;
};

const getFirstMixedModule = async (
	moduleCollection: MixedModuleCollection
) => {
	const collections = getMixedModuleCollections(moduleCollection);

	for (const collection of collections) {
		const response = await getItems(
			collection,
			{
				fields: [
					'key',
					'max_items',
					'prefilter',
					{
						translations: [
							'languages_code',
							'title',
							'description',
							'disclaimer_text',
							'primary_cta_label',
							'primary_cta_url',
							'secondary_cta_label',
							'secondary_cta_url'
						]
					},
					{
						sources: ['entity_type']
					}
				],
				limit: 1
			} as any,
			null
		);

		if (!Array.isArray(response) || isEmpty(response)) continue;

		const [module] = response as Array<StopoverMixedExperienceModuleSchema>;
		return module;
	}

	return null;
};

const buildMixedSourceItemsQuery = (
	collectionName: keyof Schema,
	locale: string,
	maxItems: number,
	prefilter: string | null
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
		_and: [isPromotionPrefilter(prefilter) ? promoOnlyFilter : undefined].filter((v) => isNotNil(v))
	} as any,
	deep: {
		translations: {
			_filter: getTranslationsFilter(collectionName, locale)
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

const getMixedExperienceEntities = async (
	module: StopoverMixedExperienceModuleSchema,
	moduleCollection: MixedModuleCollection,
	locale: string
) => {
	let workingModule: StopoverMixedExperienceModuleSchema | null = module;

	if ((isNil(workingModule.sources) || isEmpty(workingModule.sources)) && workingModule.key) {
		workingModule = await getMixedModuleDetailsByKey(moduleCollection, workingModule.key);
	}

	if (!workingModule || isNil(workingModule.sources) || isEmpty(workingModule.sources)) return [];

	const sources = workingModule.sources;
	const maxItems = workingModule.max_items || 6;
	const prefilter = workingModule.prefilter || null;

	const sourceCollections = sources
		.map((source) => (source.entity_type ? getMixedSourceCollection(source.entity_type) : null))
		.filter((v): v is keyof Schema => isNotNil(v));

	if (isEmpty(sourceCollections)) return [];

	const uniqueCollections = Array.from(new Set(sourceCollections));

	const entitiesData = await Promise.all(
		uniqueCollections.map((collection) =>
			getItems(collection, buildMixedSourceItemsQuery(collection, locale, maxItems, prefilter), null).then(
				(items) => ({
				collection,
				items
				})
			)
		)
	);

	const flattenedItems = entitiesData
		.filter((entry) => Array.isArray(entry.items))
		.flatMap((entry) =>
			(entry.items as Array<Record<string, unknown>>).map((item) => ({ ...item, _collection: entry.collection }))
		);

	return sortAndTrimPromoItems(flattenedItems, maxItems);
};

const getStopoverHotelModuleById = async (moduleId: string | number) => {
	const response = await getItems(
		'stopover_hotel_module' as keyof Schema,
		{
			fields: stopoverHotelModuleQueryFields as any,
			filter: {
				id: {
					_eq: moduleId
				}
			},
			limit: 1
		} as any,
		null
	).catch(() => []);

	if (!Array.isArray(response) || isEmpty(response)) return null;

	const [module] = response as Array<unknown>;
	return isStopoverModuleSchema(module) ? module : null;
};

const getModuleRequest = (sections: SectionContentSchema, locale: string) => (path: string[]) => {
	const module = pathOr({}, path, sections);
	const moduleCollection = pathOr(
		null,
		[...path.slice(0, -1), 'collection'],
		sections
	) as 'stopover_mixed_experience_module' | 'stopover_mixed_experiece_module' | null;

	if (
		moduleCollection === 'stopover_mixed_experience_module' ||
		moduleCollection === 'stopover_mixed_experiece_module'
	) {
		if (!isStopoverMixedExperienceModuleSchema(module)) {
			return getFirstMixedModule(moduleCollection).then((mixedModule) => {
				if (!mixedModule) return [];
				return getMixedExperienceEntities(mixedModule, moduleCollection, locale);
			});
		}
		return getMixedExperienceEntities(module, moduleCollection, locale);
	}

	if (!isStopoverModuleSchema(module)) {
		if (moduleCollection === 'stopover_hotel_module' && (typeof module === 'string' || typeof module === 'number')) {
			return getStopoverHotelModuleById(module).then((resolvedModule) => {
				if (!resolvedModule) return [];
				const collectionName = getCollectionOfModule(resolvedModule.collection);
				if (isNil(collectionName) || isEmpty(collectionName)) return [];
				return getItems(collectionName, buildModuleQuery(resolvedModule, resolvedModule.collection, locale), null).then(
					(items) =>
						Array.isArray(items)
							? sortAndTrimPromoItems(items as SortablePromoItem[], resolvedModule.max_items ?? 6)
							: []
				);
			});
		}
		return Promise.reject(null);
	}

	const { collection } = module;

	const collectionName = getCollectionOfModule(collection);

	if (isNil(collectionName) || isEmpty(collectionName)) return Promise.reject(null);

	return getItems(collectionName, buildModuleQuery(module, collection, locale), null).then((items) =>
		Array.isArray(items) ? sortAndTrimPromoItems(items as SortablePromoItem[], module.max_items ?? 6) : []
	);
};

const setToValue = (obj: any, value: any, path: string[]) => {
	let i;
	for (i = 0; i < path.length - 1; i++) obj = obj[path[i]];

	obj[path[i]] = value;
};

export { setToValue, getModuleRequest, getAllSectionModules };
