import { z } from 'zod';
import {
	placeSchema,
	type PlaceSchema,
	placeTranslationSchema,
	type PlaceTranslation,
	type PlacesPilar
} from './types';

/**
 * Mappers: Directus → Domain View Models
 */

/**
 * Validate and map Directus place response to domain model
 */
export function mapDirectusPlaceToViewModel(
	rawData: unknown,
	locale: string
): PlaceSchema | null {
	const result = placeSchema.safeParse(rawData);

	if (!result.success) {
		console.warn('Invalid place data from Directus:', result.error);
		return null;
	}

	return result.data;
}

/**
 * Get translation for a place in specific locale
 */
export function getPlaceTranslation(
	place: PlaceSchema,
	locale: string
): PlaceTranslation | undefined {
	return (
		place.translations.find((t) => t.lang_code === locale) ||
		place.translations[0]
	);
}

/**
 * Extract place name
 */
export function getPlaceName(place: PlaceSchema, locale: string): string {
	const translation = getPlaceTranslation(place, locale);
	return translation?.name || 'Unknown Place';
}

/**
 * Place card view model for list views
 */
export interface PlaceCardViewModel {
	mainImage: string;
	name: string;
	pilar: PlacesPilar;
	activities?: string[];
	promoCode?: string;
	promoDiscountPercent?: number;
}

export function mapPlaceToCardViewModel(
	place: PlaceSchema,
	locale: string
): PlaceCardViewModel {
	const translation = getPlaceTranslation(place, locale);

	return {
		mainImage: place.main_image,
		name: translation?.name || 'Place',
		pilar: place.pilar as PlacesPilar,
		activities: place.activities ?? undefined,
		promoCode: place.promo_code ?? undefined,
		promoDiscountPercent: place.promo_discount_percent ?? undefined
	};
}

/**
 * Detailed place view model for detail pages
 */
export interface PlaceDetailViewModel extends PlaceCardViewModel {
	description: string;
	phoneNumber?: string;
	location: {
		address: string;
		city: string;
		latitude?: number;
		longitude?: number;
	};
	languages?: string[];
	gallery: Array<{ id: string }>;
}

export function mapPlaceToDetailViewModel(
	place: PlaceSchema,
	locale: string
): PlaceDetailViewModel {
	const translation = getPlaceTranslation(place, locale);
	const card = mapPlaceToCardViewModel(place, locale);

	return {
		...card,
		description: translation?.description || '',
		phoneNumber: place.phone_number ?? undefined,
		location: {
			address: place.location.address,
			city: place.location.city,
			latitude: place.location.latitude ?? undefined,
			longitude: place.location.longitude ?? undefined
		},
		languages: place.supported_languages ?? undefined,
		gallery: place.gallery.map((g) => ({ id: g.directus_files_id }))
	};
}
