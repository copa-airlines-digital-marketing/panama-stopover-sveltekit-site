import type { QueryItem } from '@directus/sdk';
import type { Schema } from '$lib/infrastructure/directus/schema';

/**
 * Query field specifications for hotels collection
 * Define exactly which fields are requested from Directus
 */

export const hotelQueryFields = [
	'main_image',
	'promo_code',
	'promo_discount_amount',
	'promo_discount_percent',
	'phone_number',
	'booking_email',
	'supported_languages',
	'includes',
	'stars',
	{ location: ['address', 'city', 'phone_code', 'latitude', 'longitude'] },
	'use_name',
	{ gallery: ['directus_files_id'] },
	{ translations: ['lang_code', 'name', 'description', 'url', 'promo_name', 'promo_description', 'path'] },
	{ parent_page: ['translations'] }
] as const;

/**
 * Build a hotel query with locale filtering
 */
export function buildHotelQuery(locale: string): QueryItem<Schema, 'stopover_hotels'> {
	return {
		fields: hotelQueryFields as any,
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
 * Query builder for filtered hotel list
 */
export function buildHotelListQuery(
	locale: string,
	filters?: {
		highlight?: boolean;
		pilar?: string[];
		category?: string;
	}
): QueryItem<Schema, 'stopover_hotels'> {
	const filterConditions: any[] = [];

	if (filters?.highlight) {
		filterConditions.push({ highlight: { _eq: true } });
	}

	if (filters?.pilar?.length) {
		filterConditions.push({ pilar: { _in: filters.pilar } });
	}

	return {
		fields: hotelQueryFields as any,
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
