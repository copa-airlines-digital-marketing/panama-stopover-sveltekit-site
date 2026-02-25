import type { QueryItem } from '@directus/sdk';
import type { Schema } from '$lib/infrastructure/directus/schema';

/**
 * Query field specifications for places collection
 */

export const placeQueryFields = [
	'main_image',
	'promo_code',
	'promo_discount_amount',
	'promo_discount_percent',
	'phone_number',
	'supported_languages',
	'activities',
	'pilar',
	{ location: ['address', 'city', 'phone_code', 'latitude', 'longitude'] },
	'use_name',
	{ gallery: ['directus_files_id'] },
	{ translations: ['lang_code', 'name', 'description', 'url', 'promo_name', 'promo_description', 'path'] },
	{ parent_page: ['translations'] }
] as const;

/**
 * Build a place query with locale filtering
 */
export function buildPlaceQuery(locale: string): QueryItem<Schema, 'stopover_place_to_visit'> {
	return {
		fields: placeQueryFields as any,
		filter: {
			translations: {
				languages_code: { _eq: locale }
			}
		} as any,
		deep: {
			translations: {
				_filter: {
					languages_code: { _eq: locale }
				}
			},
			parent_page: {
				translations: {
					_filter: { languages_code: { _eq: locale } }
				}
			}
		} as any
	};
}

/**
 * Query builder for filtered place list
 */
export function buildPlaceListQuery(
	locale: string,
	filters?: {
		highlight?: boolean;
		pilar?: string;
		activities?: string[];
	}
): QueryItem<Schema, 'stopover_place_to_visit'> {
	const filterConditions: any[] = [];

	if (filters?.highlight) {
		filterConditions.push({ highlight: { _eq: true } });
	}

	if (filters?.pilar) {
		filterConditions.push({ pilar: { _eq: filters.pilar } });
	}

	if (filters?.activities?.length) {
		filterConditions.push({ activities: { _in: filters.activities } });
	}

	return {
		fields: placeQueryFields as any,
		filter: {
			_and: [
				{ translations: { languages_code: { _eq: locale } } } as any,
				...filterConditions
			]
		},
		deep: {
			translations: {
				_filter: {
					languages_code: { _eq: locale }
				}
			}
		}
	};
}
