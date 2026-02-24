import { z } from 'zod';

/**
 * Tours Domain Types
 * View models for stopover tours
 */

// Tour translation
const tourTranslationSchema = z.object({
	languages_code: z.string(),
	path: z.string(),
	name: z.string(),
	description: z.string(),
	experience: z.string().nullish(),
	included: z.string().nullish(),
	not_included: z.string().nullish(),
	promo_name: z.string().nullish(),
	promo_description: z.string().nullish(),
	url: z.string().nullish()
});

type TourTranslation = z.infer<typeof tourTranslationSchema>;

// Tour operator
const tourOperatorSchema = z.object({
	name: z.string(),
	main_image: z.string().nullish(),
	contact: z.string().nullish(),
	network: z.string().nullish()
});

type TourOperator = z.infer<typeof tourOperatorSchema>;

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

// Complete Tour Domain Model
const tourSchema = z.object({
	main_image: z.string(),
	duration: z.string().nullish(),
	start_time: z.string().nullish(),
	meeting_point: z.string().nullish(),
	end_point: z.string().nullish(),
	category: z.string().nullish(),
	supported_languages: z.string().array().nullish(),
	pilar: z.string().array().nullish(),
	promo_code: z.string().nullish(),
	promo_discount_amount: z.string().nullish(),
	promo_discount_percent: z.number().nullish(),
	gallery: z.array(fileSchema),
	operator: tourOperatorSchema.nullish(),
	translations: z.array(tourTranslationSchema),
	parent_page: parentPageSchema.optional()
});

type TourSchema = z.infer<typeof tourSchema>;

// Type guard
const isTourSchema = (value: unknown): value is TourSchema => 
	tourSchema.safeParse(value).success;

export {
	tourSchema,
	isTourSchema,
	tourTranslationSchema,
	tourOperatorSchema,
	fileSchema,
	parentPageSchema
};

export type {
	TourSchema,
	TourTranslation,
	TourOperator,
	FileReference,
	ParentPage
};
