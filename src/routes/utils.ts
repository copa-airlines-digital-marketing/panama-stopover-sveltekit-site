import { pagePathFields } from '$lib/directus/page';
import { isContentGroupSchema, type ContentGroupContent } from '$lib/directus/content-group';
import type { SectionContentSchema, SectionSchema } from '$lib/directus/section';
import {
	isStopoverModuleSchema,
	type StopoverHotelModuleSchema
} from '$lib/directus/stopover_hotel_module';
import { isEmpty, isNil, isNotNil, pathOr } from 'ramda';
import type { QueryItem } from '@directus/sdk';
import type { Schema } from '$lib/directus/schema';
import { getItems } from '$lib/directus/utils';

const getGroupContentModules =
	(path: string[]) =>
	(result: Array<string[]>, { item }: ContentGroupContent, key: number) => {
		if (!isStopoverModuleSchema(item)) return result;

		return [...result, [...path, 'content', '' + key, 'item']];
	};

const getSectionContentModules =
	(path: number) =>
	(result: Array<string[]>, { item }: SectionContentSchema, key: number) => {
		const newPath = ['' + path, 'section_content', '' + key, 'item'];

		if (isStopoverModuleSchema(item)) return [...result, newPath];

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
	restaurants: 'stopover_restaurants',
	activities: 'stopover_place_to_visit',
	tours: 'stopover_tour',
	packages: 'stopover_package',
	transportation: 'stopover_transportation'
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

const getTranslationsFilter = (collectionName: string, locale: string) => {
	if (['hotels', 'restaurants', 'activities'].includes(collectionName))
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

const buildModuleQuery = (
	{ max_items, highlight_only, sort, promo_only, pilar }: StopoverHotelModuleSchema,
	collectionName: string,
	locale: string
): QueryItem<Schema, 'stopover_hotels'> => ({
	fields: [
		'main_image',
		'promo_discount_percent',
		'promo_discount_amount',
		{ translations: ['name', 'path', 'promo_name'] },
		{ parent_page: pagePathFields }
	],
	filter: {
		_and: [
			promo_only ? promoOnlyFilter : undefined,
			highlight_only ? { highlight: { _eq: true } } : undefined,
			pilar ? { pilar: { _in: pilar } } : undefined
		].filter((v) => isNotNil(v))
	},
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
	},
	sort: (sort && sort.map((v) => (v.order === 'asc' ? v.by : '-' + v.by))) || [],
	limit: max_items
});

const getModuleRequest = (sections: SectionContentSchema, locale: string) => (path: string[]) => {
	const module = pathOr({}, path, sections);

	if (!isStopoverModuleSchema(module)) return Promise.reject(null);

	const { collection } = module;

	const collectionName = getCollectionOfModule(collection);

	if (isNil(collectionName) || isEmpty(collectionName)) return Promise.reject(null);

	return getItems(collectionName, buildModuleQuery(module, collection, locale), null);
};

const setToValue = (obj: any, value: any, path: string[]) => {
	let i;
	for (i = 0; i < path.length - 1; i++) obj = obj[path[i]];

	obj[path[i]] = value;
};

export { setToValue, getModuleRequest, getAllSectionModules };
