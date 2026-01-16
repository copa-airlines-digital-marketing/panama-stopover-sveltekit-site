import type { QueryItem } from '@directus/sdk';
import type { Schema } from '$lib/infrastructure/directus/schema';
import { pagePathFields } from '../pages/schemas';

/**
 * Query field specifications for tours collection
 */

export const tourQueryFields = [
	'main_image',
	'duration',
	'start_time',
	'meeting_point',
	'end_point',
	'category',
	'supported_languages',
	'pilar',
	'promo_code',
	'promo_discount_amount',
	'promo_discount_percent',
	{ gallery: ['directus_files_id'] },
	{ operator: ['name', 'main_image', 'contact', 'network'] },
	{
		translations: [
			'languages_code',
			'path',
			'name',
			'description',
			'experience',
			'included',
			'not_included',
			'promo_name',
			'promo_description',
			'url'
		]
	},
	{ parent_page: pagePathFields }
] as const;

/**
 * Build a tour query by path
 */
export function buildTourByPathQuery(
	locale: string,
	category: string,
	subCategory: string,
	article: string
): QueryItem<Schema, 'stopover_tour'> {
	return {
		fields: tourQueryFields as any,
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
 * Build a tour list query
 */
export function buildTourListQuery(
	locale: string,
	filters?: {
		category?: string;
		pilar?: string[];
		operator?: string;
		promoOnly?: boolean;
	}
): QueryItem<Schema, 'stopover_tour'> {
	const filterConditions: any[] = [];

	if (filters?.category) {
		filterConditions.push({ category: { _eq: filters.category } });
	}

	if (filters?.pilar?.length) {
		filterConditions.push({ pilar: { _in: filters.pilar } });
	}

	if (filters?.operator) {
		filterConditions.push({ operator: { name: { _eq: filters.operator } } });
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
		fields: tourQueryFields as any,
		filter: {
			_and: [
				{ translations: { languages_code: { _eq: locale } } } as any,
				...filterConditions
			]
		}
	};
}
