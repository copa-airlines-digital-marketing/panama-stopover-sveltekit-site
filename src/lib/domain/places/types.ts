import { z } from 'zod';

/**
 * Place Domain Types
 * View models for places to visit
 */

// Translation object for a place
const placeTranslationSchema = z.object({
	lang_code: z.string(),
	name: z.string(),
	description: z.string(),
	url: z.string().nullish(),
	promo_name: z.string().nullish(),
	promo_description: z.string().nullish(),
	path: z.string().nullish()
});

type PlaceTranslation = z.infer<typeof placeTranslationSchema>;

// Location information
const locationSchema = z.object({
	address: z.string(),
	city: z.string(),
	phone_code: z.string().nullish(),
	latitude: z.number().nullish(),
	longitude: z.number().nullish()
});

type Location = z.infer<typeof locationSchema>;

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

// Complete Place Domain Model
const placeSchema = z.object({
	main_image: z.string(),
	promo_code: z.string().nullish(),
	promo_discount_amount: z.string().nullish(),
	promo_discount_percent: z.number().nullish(),
	phone_number: z.string().nullish(),
	supported_languages: z.string().array().nullish(),
	activities: z.string().array().nullish(),
	location: locationSchema,
	use_name: z.boolean().nullish(),
	gallery: z.array(fileSchema),
	translations: z.array(placeTranslationSchema),
	parent_page: parentPageSchema.optional(),
	pilar: z.string()
});

type PlaceSchema = z.infer<typeof placeSchema>;

// Type guard
const isPlaceSchema = (value: unknown): value is PlaceSchema => 
	placeSchema.safeParse(value).success;

// Pilar (category) schema
const placesPilarSchema = z.enum(['canal', 'culture', 'gastronomy', 'nature']);
type PlacesPilar = z.infer<typeof placesPilarSchema>;

export {
	placeSchema,
	isPlaceSchema,
	locationSchema,
	placeTranslationSchema,
	fileSchema,
	parentPageSchema,
	placesPilarSchema
};

export type {
	PlaceSchema,
	PlaceTranslation,
	Location,
	FileReference,
	ParentPage,
	PlacesPilar
};
