import { z } from 'zod';

/**
 * Pages Domain Types
 * View models for CMS pages
 */

// Page translation
const pageTranslationSchema = z.object({
	languages_code: z.string(),
	path: z.string(),
	title_tag: z.string(),
	meta_description: z.string()
});

type PageTranslation = z.infer<typeof pageTranslationSchema>;

// Path (for breadcrumbs and navigation)
const pathSchema: z.ZodType<PathSchema> = z.lazy(() =>
	z.object({
		translations: z
			.object({ path: z.string(), languages_code: z.string(), title_tag: z.string() })
			.array(),
		parent: pathSchema.optional().nullable()
	})
);

type PathSchema = {
	translations: {
		languages_code: string;
		path: string;
		title_tag: string;
	}[];
	parent?: PathSchema | null;
};

// Complete Page Domain Model
const pageSchema = z.object({
	id: z.number(),
	share_image: z.string().nullable(),
	translations: pageTranslationSchema.array(),
	index: z.boolean(),
	head_code: z.string().nullable(),
	start_of_body_code: z.string().nullable(),
	end_of_body_code: z.string().nullable(),
	parent: pathSchema.optional().nullable()
});

type PageSchema = z.infer<typeof pageSchema>;

// Type guard
const isPageSettings = (value: unknown): value is PageSchema => 
	pageSchema.safeParse(value).success;

export {
	pageSchema,
	pathSchema,
	isPageSettings,
	pageTranslationSchema
};

export type {
	PageSchema,
	PathSchema,
	PageTranslation
};
