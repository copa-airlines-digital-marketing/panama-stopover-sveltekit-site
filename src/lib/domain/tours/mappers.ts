import { z } from 'zod';
import {
	tourSchema,
	type TourSchema,
	type TourTranslation,
	type TourOperator
} from './types';

/**
 * Mappers: Directus → Domain View Models
 */

/**
 * Validate and map Directus tour response to domain model
 */
export function mapDirectusTourToViewModel(
	rawData: unknown,
	locale: string
): TourSchema | null {
	const result = tourSchema.safeParse(rawData);

	if (!result.success) {
		console.warn('Invalid tour data from Directus:', result.error);
		return null;
	}

	return result.data;
}

/**
 * Get translation for a tour in specific locale
 */
export function getTourTranslation(
	tour: TourSchema,
	locale: string
): TourTranslation | undefined {
	return (
		tour.translations.find((t) => t.languages_code === locale) ||
		tour.translations[0]
	);
}

/**
 * Extract tour name
 */
export function getTourName(tour: TourSchema, locale: string): string {
	const translation = getTourTranslation(tour, locale);
	return translation?.name || 'Tour';
}

/**
 * Tour card view model for list views
 */
export interface TourCardViewModel {
	mainImage: string;
	name: string;
	duration?: string;
	categoryLabel?: string;
	operator?: {
		name: string;
		image?: string;
	};
	promoCode?: string;
	promoDiscountPercent?: number;
}

export function mapTourToCardViewModel(
	tour: TourSchema,
	locale: string
): TourCardViewModel {
	const translation = getTourTranslation(tour, locale);
	const categoryTranslation = tour.experience_category?.translations?.find(
		(t) => t.languages_code === locale
	) ?? tour.experience_category?.translations?.[0];

	return {
		mainImage: tour.main_image,
		name: translation?.name || 'Tour',
		duration: tour.duration ?? undefined,
		categoryLabel: categoryTranslation?.label ?? undefined,
		operator: tour.operator ? {
			name: tour.operator.name,
			image: tour.operator.main_image ?? undefined
		} : undefined,
		promoCode: tour.promo_code ?? undefined,
		promoDiscountPercent: tour.promo_discount_percent ?? undefined
	};
}

/**
 * Detailed tour view model for detail pages
 */
export interface TourDetailViewModel extends TourCardViewModel {
	description: string;
	experience?: string;
	included?: string;
	notIncluded?: string;
	startTime?: string;
	meetingPoint?: string;
	endPoint?: string;
	languages?: string[];
	pilar?: string[];
	gallery: Array<{ id: string }>;
	operator?: TourOperator;
}

export function mapTourToDetailViewModel(
	tour: TourSchema,
	locale: string
): TourDetailViewModel {
	const translation = getTourTranslation(tour, locale);
	const card = mapTourToCardViewModel(tour, locale);

	return {
		...card,
		description: translation?.description || '',
		experience: translation?.experience ?? undefined,
		included: translation?.included ?? undefined,
		notIncluded: translation?.not_included ?? undefined,
		startTime: tour.start_time ?? undefined,
		meetingPoint: tour.meeting_point ?? undefined,
		endPoint: tour.end_point ?? undefined,
		languages: tour.supported_languages ?? undefined,
		pilar: tour.pilar ?? undefined,
		gallery: tour.gallery.map((g) => ({ id: g.directus_files_id })),
		operator: tour.operator ?? undefined
	};
}
