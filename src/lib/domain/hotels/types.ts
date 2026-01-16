import { z } from 'zod';

/**
 * Hotel Domain Types
 * These are narrowed view models based on the actual Directus query fields.
 * DO NOT use raw Directus collection types.
 */

// Translation object for a hotel
const hotelTranslationSchema = z.object({
	lang_code: z.string(),
	name: z.string(),
	description: z.string(),
	url: z.string().nullish(),
	promo_name: z.string().nullish(),
	promo_description: z.string().nullish(),
	path: z.string().nullish()
});

type HotelTranslation = z.infer<typeof hotelTranslationSchema>;

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

// Parent page reference (for breadcrumbs, etc.)
const parentPageSchema = z.object({
	translations: z.array(z.object({
		path: z.string(),
		languages_code: z.string(),
		title_tag: z.string()
	})).nullish()
});

type ParentPage = z.infer<typeof parentPageSchema>;

// Complete Hotel Domain Model
const hotelSchema = z.object({
	main_image: z.string(),
	promo_code: z.string().nullish(),
	promo_discount_amount: z.string().nullish(),
	promo_discount_percent: z.number().nullish(),
	phone_number: z.string(),
	booking_email: z.string(),
	supported_languages: z.string().array(),
	includes: z.string().array(),
	stars: z.number(),
	location: locationSchema,
	use_name: z.boolean(),
	gallery: z.array(fileSchema),
	translations: z.array(hotelTranslationSchema),
	parent_page: parentPageSchema.optional()
});

type HotelSchema = z.infer<typeof hotelSchema>;

// Type guard
const isHotelSchema = (value: unknown): value is HotelSchema => 
	hotelSchema.safeParse(value).success;

export {
	hotelSchema,
	isHotelSchema,
	locationSchema,
	hotelTranslationSchema,
	fileSchema,
	parentPageSchema
};

export type {
	HotelSchema,
	HotelTranslation,
	Location,
	FileReference,
	ParentPage
};
