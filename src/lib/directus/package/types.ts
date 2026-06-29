import { pagePathFields } from '../page';
import type { PackageSchema } from '$lib/domain/packages';

type StopoverPackageQuery = PackageSchema;

const getPackageQuery = (
	locale: string | number,
	category: string | number,
	subCategory: string | number,
	article: string | number
) => ({
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
} as const);

export type { StopoverPackageQuery };

export { getPackageQuery };
