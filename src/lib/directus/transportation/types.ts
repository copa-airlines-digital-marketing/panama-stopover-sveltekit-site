import { pagePathFields } from '../page';
import type { TransportationSchema } from '$lib/domain/transportation';

type TransportationQuery = TransportationSchema;
type TransportationTranslationQuery = TransportationSchema['translations'][number];

const getTransportationQuery = (
	locale: string,
	category: string,
	subCategory: string,
	article: string
) => ({
	fields: [
		'name',
		'main_image',
		'promo_code',
		'promo_discount_amount',
		'promo_discount_percent',
		'supported_languages',
		'category',
		'contact',
		'gallery',
		{ gallery: ['directus_files_id', 'sort'] },
		{ translations: ['languages_code', 'name', 'promo_name', 'promo_description', 'url', 'path'] },
		{ parent_page: pagePathFields }
	],
	filter: {
		_and: [
			{ translations: { languages_code: { _eq: locale } } },
			{ translations: { path: { _eq: article } } },
			{ parent_page: { translations: { languages_code: { _eq: locale } } } },
			{ parent_page: { translations: { path: { _eq: subCategory } } } },
			{ parent_page: { parent: { translations: { languages_code: { _eq: locale } } } } },
			{ parent_page: { parent: { translations: { path: { _eq: category } } } } },
			{
				parent_page: { parent: { parent: { translations: { languages_code: { _eq: locale } } } } }
			},
			{ parent_page: { parent: { parent: { translations: { path: { _eq: locale } } } } } }
		]
	}
} as const);

export type { TransportationQuery, TransportationTranslationQuery };

export { getTransportationQuery };
