import { any, z } from 'zod';

const stopoverMixedExperienceTranslationSchema = z.object({
	languages_code: z.string().nullable().optional(),
	title: z.string().nullable().optional(),
	description: z.string().nullable().optional(),
	disclaimer_text: z.string().nullable().optional(),
	primary_cta_label: z.string().nullable().optional(),
	primary_cta_url: z.string().nullable().optional(),
	secondary_cta_label: z.string().nullable().optional(),
	secondary_cta_url: z.string().nullable().optional(),
	reference_point_label: z.string().nullable().optional(),
	filter_language_label: z.string().nullable().optional(),
	filter_category_label: z.string().nullable().optional(),
	filter_discount_label: z.string().nullable().optional(),
	filter_duration_label: z.string().nullable().optional(),
	filter_distance_label: z.string().nullable().optional(),
	filter_apply_label: z.string().nullable().optional()
});

const stopoverMixedExperienceSourceTranslationSchema = z.object({
	languages_code: z.string().nullable().optional(),
	label: z.string().nullable().optional()
});

const stopoverMixedExperienceSourceSchema = z.object({
	id: z.number().optional(),
	entity_type: z.string().nullable().optional(),
	max_items: z.number().nullable().optional(),
	status: z.string().nullable().optional(),
	translations: stopoverMixedExperienceSourceTranslationSchema.array().nullable().optional(),
	item: z.union([z.number(), z.string(), z.record(z.string(), any())]).nullable().optional()
});

const stopoverMixedExperienceModuleSchema = z.object({
	key: z.string(),
	max_items: z.number().optional(),
	prefilter: z.string().nullable().optional(),
	filter_language_enabled: z.boolean().nullable().optional(),
	filter_category_enabled: z.boolean().nullable().optional(),
	filter_discount_enabled: z.boolean().nullable().optional(),
	filter_duration_enabled: z.boolean().nullable().optional(),
	filter_distance_enabled: z.boolean().nullable().optional(),
	translations: stopoverMixedExperienceTranslationSchema.array().nullable().optional(),
	sources: stopoverMixedExperienceSourceSchema.array().nullable().optional(),
	items: any().array().optional()
});

const stopoverMixedExperienceModuleQueryFields = [
	'key',
	'max_items',
	'prefilter',
	'filter_language_enabled',
	'filter_category_enabled',
	'filter_discount_enabled',
	'filter_duration_enabled',
	'filter_distance_enabled',
	'translations.languages_code',
	'translations.title',
	'translations.description',
	'translations.disclaimer_text',
	'translations.primary_cta_label',
	'translations.primary_cta_url',
	'translations.secondary_cta_label',
	'translations.secondary_cta_url',
	'translations.reference_point_label',
	'translations.filter_language_label',
	'translations.filter_category_label',
	'translations.filter_discount_label',
	'translations.filter_duration_label',
	'translations.filter_distance_label',
	'translations.filter_apply_label',
	'sources.id',
	'sources.entity_type',
	'sources.max_items',
	'sources.status',
	'sources.translations.languages_code',
	'sources.translations.label'
];

type StopoverMixedExperienceModuleSchema = z.infer<typeof stopoverMixedExperienceModuleSchema>;
type StopoverMixedExperienceTranslationSchema = z.infer<
	typeof stopoverMixedExperienceTranslationSchema
>;
type StopoverMixedExperienceSourceSchema = z.infer<typeof stopoverMixedExperienceSourceSchema>;
type StopoverMixedExperienceSourceTranslationSchema = z.infer<
	typeof stopoverMixedExperienceSourceTranslationSchema
>;

const isStopoverMixedExperienceModuleSchema = (
	value: unknown
): value is StopoverMixedExperienceModuleSchema =>
	stopoverMixedExperienceModuleSchema.safeParse(value).success;

export {
	stopoverMixedExperienceModuleSchema,
	stopoverMixedExperienceTranslationSchema,
	stopoverMixedExperienceSourceSchema,
	stopoverMixedExperienceSourceTranslationSchema,
	isStopoverMixedExperienceModuleSchema,
	stopoverMixedExperienceModuleQueryFields
};

export type {
	StopoverMixedExperienceModuleSchema,
	StopoverMixedExperienceTranslationSchema,
	StopoverMixedExperienceSourceSchema,
	StopoverMixedExperienceSourceTranslationSchema
};
