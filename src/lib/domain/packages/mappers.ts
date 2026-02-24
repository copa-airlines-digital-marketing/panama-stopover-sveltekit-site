import { z } from 'zod';
import {
	packageSchema,
	type PackageSchema,
	type PackageTranslation
} from './types';

/**
 * Mappers: Directus → Domain View Models
 */

/**
 * Validate and map Directus package response to domain model
 */
export function mapDirectusPackageToViewModel(
	rawData: unknown,
	locale: string
): PackageSchema | null {
	const result = packageSchema.safeParse(rawData);

	if (!result.success) {
		console.warn('Invalid package data from Directus:', result.error);
		return null;
	}

	return result.data;
}

/**
 * Get translation for a package in specific locale
 */
export function getPackageTranslation(
	pkg: PackageSchema,
	locale: string
): PackageTranslation | undefined {
	return (
		pkg.translations.find((t) => t.languages_code === locale) ||
		pkg.translations[0]
	);
}

/**
 * Extract package name
 */
export function getPackageName(pkg: PackageSchema, locale: string): string {
	const translation = getPackageTranslation(pkg, locale);
	return translation?.name || pkg.name || 'Package';
}

/**
 * Package card view model for list views
 */
export interface PackageCardViewModel {
	name: string;
	nights: number;
	mainImage: string;
	region?: string;
	promoCode?: string;
	promoDiscountPercent?: number;
}

export function mapPackageToCardViewModel(
	pkg: PackageSchema,
	locale: string
): PackageCardViewModel {
	const translation = getPackageTranslation(pkg, locale);

	return {
		name: translation?.name || pkg.name,
		nights: pkg.nights,
		mainImage: pkg.main_image,
		region: pkg.stay_region ?? undefined,
		promoCode: pkg.promo_code ?? undefined,
		promoDiscountPercent: pkg.promo_discount_percent ?? undefined
	};
}

/**
 * Detailed package view model for detail pages
 */
export interface PackageDetailViewModel extends PackageCardViewModel {
	description: string;
	included?: string;
	notIncluded?: string;
	contact?: string;
	languages?: string[];
	gallery: Array<{ id: string; sort?: number }>;
}

export function mapPackageToDetailViewModel(
	pkg: PackageSchema,
	locale: string
): PackageDetailViewModel {
	const translation = getPackageTranslation(pkg, locale);
	const card = mapPackageToCardViewModel(pkg, locale);

	return {
		...card,
		description: translation?.description || '',
		included: translation?.included ?? undefined,
		notIncluded: translation?.not_included ?? undefined,
		contact: pkg.contact ?? undefined,
		languages: pkg.supported_languages ?? undefined,
		gallery: pkg.gallery.map((g) => ({ 
			id: g.directus_files_id,
			sort: g.sort ?? undefined
		}))
	};
}
