import type { QueryItem } from '@directus/sdk';
import type { Schema } from '$lib/infrastructure/directus/schema';
import { pagePathFields } from '../pages/schemas';

/**
 * Query field specifications for transportation collection
 */

export const transportationQueryFields = [
	'main_image',
	'type',
	'contact',
	'supported_languages',
	'promo_code',
	'promo_discount_amount',
	'promo_discount_percent',
	{ gallery: ['directus_files_id'] },
	{
		translations: [
			'languages_code',
			'path',
			'name',
			'description',
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
 * Build a transportation query by path
 */
export function buildTransportationByPathQuery(
	locale: string,
	category: string,
	subCategory: string,
	article: string
): QueryItem<Schema, 'stopover_transportation'> {
	return {
		fields: transportationQueryFields as any,
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
 * Build a transportation list query
 */
export function buildTransportationListQuery(
	locale: string,
	filters?: {
		type?: string;
		promoOnly?: boolean;
	}
): QueryItem<Schema, 'stopover_transportation'> {
	const filterConditions: any[] = [];

	if (filters?.type) {
		filterConditions.push({ type: { _eq: filters.type } });
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
		fields: transportationQueryFields as any,
		filter: {
			_and: [
				{ translations: { languages_code: { _eq: locale } } } as any,
				...filterConditions
			]
		}
	};
}
