import { z } from 'zod';
import {
	transportationSchema,
	type TransportationSchema,
	type TransportationTranslation
} from './types';

/**
 * Mappers: Directus → Domain View Models
 */

/**
 * Validate and map Directus transportation response to domain model
 */
export function mapDirectusTransportationToViewModel(
	rawData: unknown,
	locale: string
): TransportationSchema | null {
	const result = transportationSchema.safeParse(rawData);

	if (!result.success) {
		console.warn('Invalid transportation data from Directus:', result.error);
		return null;
	}

	return result.data;
}

/**
 * Get translation for transportation in specific locale
 */
export function getTransportationTranslation(
	transportation: TransportationSchema,
	locale: string
): TransportationTranslation | undefined {
	return (
		transportation.translations.find((t) => t.languages_code === locale) ||
		transportation.translations[0]
	);
}

/**
 * Extract transportation name
 */
export function getTransportationName(transportation: TransportationSchema, locale: string): string {
	const translation = getTransportationTranslation(transportation, locale);
	return translation?.name || 'Transportation';
}

/**
 * Transportation card view model for list views
 */
export interface TransportationCardViewModel {
	mainImage: string;
	name: string;
	type?: string;
	contact?: string;
	promoCode?: string;
	promoDiscountPercent?: number;
}

export function mapTransportationToCardViewModel(
	transportation: TransportationSchema,
	locale: string
): TransportationCardViewModel {
	const translation = getTransportationTranslation(transportation, locale);

	return {
		mainImage: transportation.main_image,
		name: translation?.name || 'Transportation',
		type: transportation.type ?? undefined,
		contact: transportation.contact ?? undefined,
		promoCode: transportation.promo_code ?? undefined,
		promoDiscountPercent: transportation.promo_discount_percent ?? undefined
	};
}

/**
 * Detailed transportation view model for detail pages
 */
export interface TransportationDetailViewModel extends TransportationCardViewModel {
	description: string;
	included?: string;
	notIncluded?: string;
	languages?: string[];
	gallery: Array<{ id: string }>;
}

export function mapTransportationToDetailViewModel(
	transportation: TransportationSchema,
	locale: string
): TransportationDetailViewModel {
	const translation = getTransportationTranslation(transportation, locale);
	const card = mapTransportationToCardViewModel(transportation, locale);

	return {
		...card,
		description: translation?.description || '',
		included: translation?.included ?? undefined,
		notIncluded: translation?.not_included ?? undefined,
		languages: transportation.supported_languages ?? undefined,
		gallery: transportation.gallery.map((g) => ({ id: g.directus_files_id }))
	};
}
