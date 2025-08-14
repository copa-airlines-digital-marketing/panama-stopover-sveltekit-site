import type {
	StopoverTransportation,
	StopoverTransportationFiles,
	StopoverTransportationTranslations
} from '$cms/collections/stopover_transportation';
import type { Query } from '@directus/sdk';
import type { pagePathFields } from '../page';

type FilesQuery = Pick<StopoverTransportationFiles, 'directus_files_id' | 'sort'>;

type TranslationsQuery = Pick<
	StopoverTransportationTranslations,
	'languages_code' | 'name' | 'promo_name' | 'promo_description' | 'url' | 'path'
>;

type TransportationQuery = Pick<
	StopoverTransportation,
	| 'parent_page'
	| 'name'
	| 'main_image'
	| 'gallery'
	| 'promo_code'
	| 'promo_discount_amount'
	| 'promo_discount_percent'
	| 'translations'
	| 'supported_languages'
	| 'category'
	| 'contact'
> & {
	gallery: FilesQuery;
	translations: TranslationsQuery;
	parent_page: typeof pagePathFields;
};

const getTransportationQuery = (
	locale: string,
	category: string,
	subCategory: string,
	article: string
): Query<Schema, StopoverTransportation> => ({
	fields: [
		'parent_page',
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
		{ translations: ['languages_code', 'name', 'promo_name', 'promo_description', 'url', 'path'] }
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
});

export type { TransportationQuery, TranslationsQuery as TransportationTranslationQuery };

export { getTransportationQuery };
