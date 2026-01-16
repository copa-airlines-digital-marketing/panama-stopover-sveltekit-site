import { z } from 'zod';
import {
	hotelSchema,
	type HotelSchema,
	hotelTranslationSchema,
	type HotelTranslation
} from './types';

/**
 * Mappers: Directus -> Domain View Models
 * 
 * Purpose:
 * - Convert Directus API responses into strongly-typed domain models
 * - Apply transformations (e.g., filter to active locale, restructure data)
 * - Validate data at boundary using Zod
 */

/**
 * Validate and map Directus hotel response to domain model
 * Treats response as unknown, validates with Zod, returns typed result
 */
export function mapDirectusHotelToViewModel(
	rawData: unknown,
	locale: string
): HotelSchema | null {
	const result = hotelSchema.safeParse(rawData);

	if (!result.success) {
		console.warn('Invalid hotel data from Directus:', result.error);
		return null;
	}

	return result.data;
}

/**
 * Get translation for a hotel in specific locale
 * Fallback to first translation if exact locale not found
 */
export function getHotelTranslation(
	hotel: HotelSchema,
	locale: string
): HotelTranslation | undefined {
	return (
		hotel.translations.find((t) => t.lang_code === locale) ||
		hotel.translations[0]
	);
}

/**
 * Extract hotel name (with fallback)
 */
export function getHotelName(hotel: HotelSchema, locale: string): string {
	const translation = getHotelTranslation(hotel, locale);
	return translation?.name || 'Unknown Hotel';
}

/**
 * Create a simple hotel card model from full hotel for list views
 */
export interface HotelCardViewModel {
	mainImage: string;
	name: string;
	stars: number;
	isHighlight: boolean;
	promoCode?: string;
	promoDiscountPercent?: number;
}

export function mapHotelToCardViewModel(
	hotel: HotelSchema,
	locale: string
): HotelCardViewModel {
	const translation = getHotelTranslation(hotel, locale);

	return {
		mainImage: hotel.main_image,
		name: translation?.name || 'Hotel',
		stars: hotel.stars,
		isHighlight: false, // Would come from API if available
		promoCode: hotel.promo_code ?? undefined,
		promoDiscountPercent: hotel.promo_discount_percent ?? undefined
	};
}

/**
 * Create detailed hotel view model for detail pages
 */
export interface HotelDetailViewModel extends HotelCardViewModel {
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
	includes: string[];
	gallery: Array<{ id: string }>;
}

export function mapHotelToDetailViewModel(
	hotel: HotelSchema,
	locale: string
): HotelDetailViewModel {
	const translation = getHotelTranslation(hotel, locale);
	const card = mapHotelToCardViewModel(hotel, locale);

	return {
		...card,
		description: translation?.description || '',
		phoneNumber: hotel.phone_number,
		bookingEmail: hotel.booking_email,
		location: {
			address: hotel.location.address,
			city: hotel.location.city,
			latitude: hotel.location.latitude ?? undefined,
			longitude: hotel.location.longitude ?? undefined
		},
		languages: hotel.supported_languages,
		includes: hotel.includes,
		gallery: hotel.gallery.map((g) => ({ id: g.directus_files_id }))
	};
}
