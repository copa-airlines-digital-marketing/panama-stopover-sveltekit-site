import { z } from 'zod';
import {
	pageSchema,
	type PageSchema,
	type PathSchema,
	type PageTranslation
} from './types';

/**
 * Mappers: Directus → Domain View Models
 */

/**
 * Validate and map Directus page response to domain model
 */
export function mapDirectusPageToViewModel(
	rawData: unknown
): PageSchema | null {
	const result = pageSchema.safeParse(rawData);

	if (!result.success) {
		console.warn('Invalid page data from Directus:', result.error);
		return null;
	}

	return result.data;
}

/**
 * Get translation for a page in specific locale
 */
export function getPageTranslation(
	page: PageSchema,
	locale: string
): PageTranslation | undefined {
	return (
		page.translations.find((t) => t.languages_code === locale) ||
		page.translations[0]
	);
}

/**
 * Extract page title
 */
export function getPageTitle(page: PageSchema, locale: string): string {
	const translation = getPageTranslation(page, locale);
	return translation?.title_tag || 'Page';
}

/**
 * Get full path for a page (including parent paths)
 */
export function getFullPath(page: PageSchema, locale: string): string {
	const translation = getPageTranslation(page, locale);
	if (!translation) return '/';

	const segments: string[] = [translation.path];
	
	let current = page.parent;
	while (current) {
		const parentTranslation = current.translations.find(t => t.languages_code === locale);
		if (parentTranslation) {
			segments.unshift(parentTranslation.path);
		}
		current = current.parent;
	}

	return '/' + segments.join('/');
}

/**
 * Page view model for rendering
 */
export interface PageViewModel {
	id: number;
	title: string;
	metaDescription: string;
	path: string;
	fullPath: string;
	shareImage: string | null;
	isIndex: boolean;
	headCode: string | null;
	startOfBodyCode: string | null;
	endOfBodyCode: string | null;
}

export function mapPageToViewModel(
	page: PageSchema,
	locale: string
): PageViewModel {
	const translation = getPageTranslation(page, locale);

	return {
		id: page.id,
		title: translation?.title_tag || 'Page',
		metaDescription: translation?.meta_description || '',
		path: translation?.path || '',
		fullPath: getFullPath(page, locale),
		shareImage: page.share_image,
		isIndex: page.index,
		headCode: page.head_code,
		startOfBodyCode: page.start_of_body_code,
		endOfBodyCode: page.end_of_body_code
	};
}

/**
 * Breadcrumb item for navigation
 */
export interface BreadcrumbItem {
	title: string;
	path: string;
}

export function buildBreadcrumbs(page: PageSchema, locale: string): BreadcrumbItem[] {
	const breadcrumbs: BreadcrumbItem[] = [];
	
	let current: PageSchema | PathSchema | undefined | null = page;
	
	while (current) {
		const translation = current.translations.find(t => t.languages_code === locale);
		if (translation) {
			breadcrumbs.unshift({
				title: translation.title_tag,
				path: translation.path
			});
		}
		current = current.parent;
	}

	return breadcrumbs;
}
