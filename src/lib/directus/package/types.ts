import type {
	StopoverPackage,
	StopoverPackageFiles,
	StopoverPackageTranslation
} from '$cms/collections/stopover_package';
import type { Query } from '@directus/sdk';
import { pagePathFields } from '../page';

type StopoverPackageFilesQuery = Pick<StopoverPackageFiles, 'directus_files_id' | 'sort'>;

type StopoverPackageTranslationQuery = Pick<
	StopoverPackageTranslation,
	| 'languages_code'
	| 'name'
	| 'description'
	| 'included'
	| 'not_included'
	| 'promo_name'
	| 'promo_description'
	| 'url'
>;

type StopoverPackageQuery = Pick<
	StopoverPackage,
	| 'parent_page'
	| 'name'
	| 'nights'
	| 'main_image'
	| 'gallery'
	| 'contact'
	| 'supported_languages'
	| 'stay_region'
	| 'promo_code'
	| 'promo_discount_amount'
	| 'promo_discount_percent'
	| 'translations'
> & {
	gallery: StopoverPackageFilesQuery;
	translations: StopoverPackageTranslationQuery;
	parent_page: typeof pagePathFields;
};

const getPackageQuery = (
	locale: string,
	category: string,
	subCategory: string,
	article: string
): Query<Schema, StopoverPackage> => ({
	fields: [
		'parent_page',
		'name',
		'nights',
		'main_image',
		'contact',
		'supported_languages',
		'stay_region',
		'promo_code',
		'promo_discount_amount',
		'promo_discount_percent',
		{ gallery: ['directus_files_id', 'sort'] },
		{
			translations: [
				'languages_code',
				'name',
				'description',
				'included',
				'not_included',
				'promo_name',
				'promo_description',
				'url',
				'path'
			]
		},
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
});

export type { StopoverPackageQuery };

export { getPackageQuery };
