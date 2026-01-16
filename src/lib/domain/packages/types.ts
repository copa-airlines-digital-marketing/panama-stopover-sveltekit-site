import { z } from 'zod';

/**
 * Packages Domain Types
 * View models for stopover packages
 */

// Package translation
const packageTranslationSchema = z.object({
	languages_code: z.string(),
	name: z.string(),
	description: z.string(),
	included: z.string().nullish(),
	not_included: z.string().nullish(),
	promo_name: z.string().nullish(),
	promo_description: z.string().nullish(),
	url: z.string().nullish(),
	path: z.string().nullish()
});

type PackageTranslation = z.infer<typeof packageTranslationSchema>;

// File/Image schema
const fileSchema = z.object({
	directus_files_id: z.string(),
	sort: z.number().nullish()
});

type FileReference = z.infer<typeof fileSchema>;

// Parent page reference
const parentPageSchema = z.object({
	translations: z.array(z.object({
		path: z.string(),
		languages_code: z.string(),
		title_tag: z.string()
	})).nullish()
});

type ParentPage = z.infer<typeof parentPageSchema>;

// Complete Package Domain Model
const packageSchema = z.object({
	name: z.string(),
	nights: z.number(),
	main_image: z.string(),
	contact: z.string().nullish(),
	supported_languages: z.string().array().nullish(),
	stay_region: z.string().nullish(),
	promo_code: z.string().nullish(),
	promo_discount_amount: z.string().nullish(),
	promo_discount_percent: z.number().nullish(),
	gallery: z.array(fileSchema),
	translations: z.array(packageTranslationSchema),
	parent_page: parentPageSchema.optional()
});

type PackageSchema = z.infer<typeof packageSchema>;

// Type guard
const isPackageSchema = (value: unknown): value is PackageSchema => 
	packageSchema.safeParse(value).success;

export {
	packageSchema,
	isPackageSchema,
	packageTranslationSchema,
	fileSchema,
	parentPageSchema
};

export type {
	PackageSchema,
	PackageTranslation,
	FileReference,
	ParentPage
};
