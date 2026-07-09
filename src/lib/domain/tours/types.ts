import { z } from 'zod';

/**
 * Tours Domain Types
 * View models for stopover tours
 */

const namedItemSchema = z.object({
	name: z.string()
}).passthrough();

const tourExperienceSchema = z.object({
	title: z.string(),
	description: z.string(),
	type: z.string(),
	duration: z.union([z.string(), z.number()]).nullish(),
	includes_admission: z.boolean().nullish()
}).passthrough();

const contactSchema = z.object({
	form: z.string(),
	contact: z.string()
}).passthrough();

const networkSchema = z.object({
	type: z.string(),
	link: z.string()
}).passthrough();

const geoPointSchema = z.object({
	coordinates: z.number().array()
}).passthrough();

// Tour translation
const tourTranslationSchema = z.object({
	languages_code: z.string(),
	path: z.string(),
	name: z.string(),
	description: z.string(),
	experience: z.array(tourExperienceSchema).nullish(),
	included: z.array(namedItemSchema).nullish(),
	not_included: z.array(namedItemSchema).nullish(),
	promo_name: z.string().nullish(),
	promo_description: z.string().nullish(),
	url: z.string().nullish()
});

type TourTranslation = z.infer<typeof tourTranslationSchema>;

// Tour operator
const tourOperatorSchema = z.object({
	name: z.string(),
	main_image: z.string().nullish(),
	contact: z.array(contactSchema).nullish(),
	network: z.array(networkSchema).nullish()
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

// Experience category (M2O relation to a shared categories table)
const experienceCategoryTranslationSchema = z.object({
	languages_code: z.string().nullable().optional(),
	label: z.string().nullable().optional()
});

const experienceCategorySchema = z.object({
	id: z.number().nullable().optional(),
	translations: experienceCategoryTranslationSchema.array().nullable().optional()
});

// Complete Tour Domain Model
const tourSchema = z.object({
	main_image: z.string(),
	duration: z.string().nullish(),
	start_time: z.string().nullish(),
	meeting_point: geoPointSchema.nullish(),
	end_point: geoPointSchema.nullish(),
	experience_category: experienceCategorySchema.nullable().optional(),
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
	parentPageSchema,
	experienceCategorySchema,
	experienceCategoryTranslationSchema
};

export type {
	TourSchema,
	TourTranslation,
	TourOperator,
	FileReference,
	ParentPage
};
