import type { QueryItem } from '@directus/sdk';
import type { Schema } from '$lib/infrastructure/directus/schema';
import { pagePathFields } from '../pages/schemas';

/**
 * Query field specifications for packages collection
 */

export const packageQueryFields = [
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
] as const;

/**
 * Build a package query by path
 */
export function buildPackageByPathQuery(
	locale: string,
	category: string,
	subCategory: string,
	article: string
): QueryItem<Schema, 'stopover_package'> {
	return {
		fields: packageQueryFields as any,
		filter: {
			_and: [
				{ translations: { languages_code: { _eq: locale } } } as any,
				{ translations: { path: { _eq: article } } } as any,
				{ parent_page: { translations: { languages_code: { _eq: locale } } } } as any,
				{ parent_page: { translations: { path: { _eq: subCategory } } } } as any,
				{ parent_page: { parent: { translations: { languages_code: { _eq: locale } } } } } as any,
				{ parent_page: { parent: { translations: { path: { _eq: category } } } } } as any,
				{
					parent_page: { parent: { parent: { translations: { languages_code: { _eq: locale } } } } }
				} as any,
				{ parent_page: { parent: { parent: { translations: { path: { _eq: locale } } } } } } as any
			]
		}
	};
}

/**
 * Build a package list query
 */
export function buildPackageListQuery(
	locale: string,
	filters?: {
		region?: string;
		nights?: number;
		promoOnly?: boolean;
	}
): QueryItem<Schema, 'stopover_package'> {
	const filterConditions: any[] = [];

	if (filters?.region) {
		filterConditions.push({ stay_region: { _eq: filters.region } });
	}

	if (filters?.nights) {
		filterConditions.push({ nights: { _eq: filters.nights } });
	}

	if (filters?.promoOnly) {
		filterConditions.push({
			_or: [
				{ promo_discount_amount: { _nnull: true } },
				{ promo_discount_percent: { _nnull: true } },
				{ promo_code: { _nnull: true } }
			]
		});
	}

	return {
		fields: packageQueryFields as any,
		filter: {
			_and: [
				{ translations: { languages_code: { _eq: locale } } } as any,
				...filterConditions
			]
		}
	};
}
