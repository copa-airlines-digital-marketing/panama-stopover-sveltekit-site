import type { QueryItem } from '@directus/sdk';
import type { Schema } from '$lib/infrastructure/directus/schema';

/**
 * Query field specifications for restaurants collection
 */

export const restaurantQueryFields = [
	'main_image',
	'promo_code',
	'promo_discount_amount',
	'promo_discount_percent',
	'phone_number',
	'booking_email',
	'supported_languages',
	'cuisine',
	'price_range',
	'pilar',
	{ location: ['address', 'city', 'phone_code', 'latitude', 'longitude'] },
	'use_name',
	{ gallery: ['directus_files_id'] },
	{ translations: ['lang_code', 'name', 'description', 'url', 'promo_name', 'promo_description', 'path'] },
	{ parent_page: ['translations'] }
] as const;

/**
 * Build a restaurant query with locale filtering
 */
export function buildRestaurantQuery(locale: string): QueryItem<Schema, 'stopover_restaurants'> {
	return {
		fields: restaurantQueryFields as any,
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
 * Query builder for filtered restaurant list
 */
export function buildRestaurantListQuery(
	locale: string,
	filters?: {
		highlight?: boolean;
		pilar?: string[];
		cuisine?: string;
		priceRange?: string;
	}
): QueryItem<Schema, 'stopover_restaurants'> {
	const filterConditions: any[] = [];

	if (filters?.highlight) {
		filterConditions.push({ highlight: { _eq: true } });
	}

	if (filters?.pilar?.length) {
		filterConditions.push({ pilar: { _in: filters.pilar } });
	}

	if (filters?.cuisine) {
		filterConditions.push({ cuisine: { _eq: filters.cuisine } });
	}

	if (filters?.priceRange) {
		filterConditions.push({ price_range: { _eq: filters.priceRange } });
	}

	return {
		fields: restaurantQueryFields as any,
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
