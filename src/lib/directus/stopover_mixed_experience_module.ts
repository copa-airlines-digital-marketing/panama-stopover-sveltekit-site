import { any, z } from 'zod';

const stopoverMixedExperienceTranslationSchema = z.object({
	languages_code: z.string().nullable().optional(),
	title: z.string().nullable().optional(),
	description: z.string().nullable().optional(),
	disclaimer_text: z.string().nullable().optional(),
	primary_cta_label: z.string().nullable().optional(),
	primary_cta_url: z.string().nullable().optional(),
	secondary_cta_label: z.string().nullable().optional(),
	secondary_cta_url: z.string().nullable().optional()
});

const stopoverMixedExperienceSourceSchema = z.object({
	entity_type: z.string().nullable().optional(),
	item: z.union([z.number(), z.string(), z.record(z.string(), any())]).nullable().optional()
});

const stopoverMixedExperienceModuleSchema = z.object({
	key: z.string(),
	max_items: z.number().optional(),
	prefilter: z.string().nullable().optional(),
	translations: stopoverMixedExperienceTranslationSchema.array().nullable().optional(),
	sources: stopoverMixedExperienceSourceSchema.array().nullable().optional(),
	items: any().array().optional()
});

const stopoverMixedExperienceModuleQueryFields = [
	'key',
	'max_items',
	'prefilter'
];

type StopoverMixedExperienceModuleSchema = z.infer<typeof stopoverMixedExperienceModuleSchema>;

const isStopoverMixedExperienceModuleSchema = (
	value: unknown
): value is StopoverMixedExperienceModuleSchema =>
	stopoverMixedExperienceModuleSchema.safeParse(value).success;

export {
	stopoverMixedExperienceModuleSchema,
	isStopoverMixedExperienceModuleSchema,
	stopoverMixedExperienceModuleQueryFields
};

export type { StopoverMixedExperienceModuleSchema };
