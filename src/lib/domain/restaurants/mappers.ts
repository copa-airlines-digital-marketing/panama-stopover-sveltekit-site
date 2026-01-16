import { z } from 'zod';
import {
	restaurantSchema,
	type RestaurantSchema,
	restaurantTranslationSchema,
	type RestaurantTranslation
} from './types';

/**
 * Mappers: Directus → Domain View Models
 */

/**
 * Validate and map Directus restaurant response to domain model
 */
export function mapDirectusRestaurantToViewModel(
	rawData: unknown,
	locale: string
): RestaurantSchema | null {
	const result = restaurantSchema.safeParse(rawData);

	if (!result.success) {
		console.warn('Invalid restaurant data from Directus:', result.error);
		return null;
	}

	return result.data;
}

/**
 * Get translation for a restaurant in specific locale
 */
export function getRestaurantTranslation(
	restaurant: RestaurantSchema,
	locale: string
): RestaurantTranslation | undefined {
	return (
		restaurant.translations.find((t) => t.lang_code === locale) ||
		restaurant.translations[0]
	);
}

/**
 * Extract restaurant name
 */
export function getRestaurantName(restaurant: RestaurantSchema, locale: string): string {
	const translation = getRestaurantTranslation(restaurant, locale);
	return translation?.name || 'Unknown Restaurant';
}

/**
 * Restaurant card view model for list views
 */
export interface RestaurantCardViewModel {
	mainImage: string;
	name: string;
	cuisine?: string;
	priceRange?: string;
	promoCode?: string;
	promoDiscountPercent?: number;
}

export function mapRestaurantToCardViewModel(
	restaurant: RestaurantSchema,
	locale: string
): RestaurantCardViewModel {
	const translation = getRestaurantTranslation(restaurant, locale);

	return {
		mainImage: restaurant.main_image,
		name: translation?.name || 'Restaurant',
		cuisine: restaurant.cuisine ?? undefined,
		priceRange: restaurant.price_range ?? undefined,
		promoCode: restaurant.promo_code ?? undefined,
		promoDiscountPercent: restaurant.promo_discount_percent ?? undefined
	};
}

/**
 * Detailed restaurant view model for detail pages
 */
export interface RestaurantDetailViewModel extends RestaurantCardViewModel {
	description: string;
	phoneNumber: string;
	bookingEmail: string;
	location: {
		address: string;
		city: string;
		latitude?: number;
		longitude?: number;
	};
	languages: string[];
	gallery: Array<{ id: string }>;
	pilar?: string[];
}

export function mapRestaurantToDetailViewModel(
	restaurant: RestaurantSchema,
	locale: string
): RestaurantDetailViewModel {
	const translation = getRestaurantTranslation(restaurant, locale);
	const card = mapRestaurantToCardViewModel(restaurant, locale);

	return {
		...card,
		description: translation?.description || '',
		phoneNumber: restaurant.phone_number,
		bookingEmail: restaurant.booking_email,
		location: {
			address: restaurant.location.address,
			city: restaurant.location.city,
			latitude: restaurant.location.latitude ?? undefined,
			longitude: restaurant.location.longitude ?? undefined
		},
		languages: restaurant.supported_languages,
		gallery: restaurant.gallery.map((g) => ({ id: g.directus_files_id })),
		pilar: restaurant.pilar ?? undefined
	};
}
