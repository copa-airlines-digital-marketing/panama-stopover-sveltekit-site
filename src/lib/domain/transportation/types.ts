import { z } from 'zod';

/**
 * Transportation Domain Types
 * View models for stopover transportation
 */

// Transportation translation
const transportationTranslationSchema = z.object({
	languages_code: z.string(),
	path: z.string(),
	name: z.string(),
	description: z.string(),
	included: z.string().nullish(),
	not_included: z.string().nullish(),
	promo_name: z.string().nullish(),
	promo_description: z.string().nullish(),
	url: z.string().nullish()
});

type TransportationTranslation = z.infer<typeof transportationTranslationSchema>;

// File/Image schema
const fileSchema = z.object({
	directus_files_id: z.string()
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

// Complete Transportation Domain Model
const transportationSchema = z.object({
	main_image: z.string(),
	type: z.string().nullish(),
	contact: z.string().nullish(),
	supported_languages: z.string().array().nullish(),
	promo_code: z.string().nullish(),
	promo_discount_amount: z.string().nullish(),
	promo_discount_percent: z.number().nullish(),
	gallery: z.array(fileSchema),
	translations: z.array(transportationTranslationSchema),
	parent_page: parentPageSchema.optional()
});

type TransportationSchema = z.infer<typeof transportationSchema>;

// Type guard
const isTransportationSchema = (value: unknown): value is TransportationSchema => 
	transportationSchema.safeParse(value).success;

export {
	transportationSchema,
	isTransportationSchema,
	transportationTranslationSchema,
	fileSchema,
	parentPageSchema
};

export type {
	TransportationSchema,
	TransportationTranslation,
	FileReference,
	ParentPage
};
