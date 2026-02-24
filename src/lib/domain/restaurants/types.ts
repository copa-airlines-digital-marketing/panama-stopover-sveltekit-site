import { z } from 'zod';

/**
 * Restaurant Domain Types
 * View models based on actual Directus query fields
 */

// Translation object for a restaurant
const restaurantTranslationSchema = z.object({
	lang_code: z.string(),
	name: z.string(),
	description: z.string(),
	url: z.string().nullish(),
	promo_name: z.string().nullish(),
	promo_description: z.string().nullish(),
	path: z.string().nullish()
});

type RestaurantTranslation = z.infer<typeof restaurantTranslationSchema>;

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

// Complete Restaurant Domain Model
const restaurantSchema = z.object({
	main_image: z.string(),
	promo_code: z.string().nullish(),
	promo_discount_amount: z.string().nullish(),
	promo_discount_percent: z.number().nullish(),
	phone_number: z.string(),
	booking_email: z.string(),
	supported_languages: z.string().array(),
	cuisine: z.string().nullish(),
	price_range: z.string().nullish(),
	location: locationSchema,
	use_name: z.boolean(),
	gallery: z.array(fileSchema),
	translations: z.array(restaurantTranslationSchema),
	parent_page: parentPageSchema.optional(),
	pilar: z.string().array().nullish()
});

type RestaurantSchema = z.infer<typeof restaurantSchema>;

// Type guard
const isRestaurantSchema = (value: unknown): value is RestaurantSchema => 
	restaurantSchema.safeParse(value).success;

export {
	restaurantSchema,
	isRestaurantSchema,
	locationSchema,
	restaurantTranslationSchema,
	fileSchema,
	parentPageSchema
};

export type {
	RestaurantSchema,
	RestaurantTranslation,
	Location,
	FileReference,
	ParentPage
};
