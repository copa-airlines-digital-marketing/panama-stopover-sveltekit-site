import { z } from 'zod';
import { navigationQuery, navigationSchema } from './navigation';
import { textContentQuery, textContentSchema } from './text-content';
import { stopoverHotelModuleQueryFields, stopoverHotelModuleSchema } from './stopover_hotel_module';
import {
	stopoverMixedExperienceModuleQueryFields,
	stopoverMixedExperienceModuleSchema
} from './stopover_mixed_experience_module';
import { formQueryFields, formSchema } from './forms';
import { flightSearchFormQueryFields, flightSearchFormSchema } from './flight-search-form';

const contentGroupTranslation = z.object({
	languages_code: z.string().optional(),
	title: z.string()
});

const contentGroupCollectionName = z.union([
	z.literal('navigation'),
	z.literal('Text_Content'),
	z.literal('form'),
	z.literal('content_group'),
	z.literal('stopover_hotel_module'),
	z.literal('stopover_mixed_experience_module'),
	z.literal('stopover_mixed_experiece_module'),
	z.literal('block_flight_search_form')
]);

const contentGroupItems = z.union([
	navigationSchema,
	textContentSchema,
	stopoverHotelModuleSchema,
	stopoverMixedExperienceModuleSchema,
	formSchema,
	flightSearchFormSchema
]);

const contentGroupContentSchema = z.object({
	item: contentGroupItems.nullable(),
	component: z.string().nullable(),
	collection: contentGroupCollectionName
});

const contentGroupSchema = z.object({
	translations: contentGroupTranslation.array().nullable(),
	content: contentGroupContentSchema.array().nullable()
});

const contentGroupQueryFields = [
	{
		translations: ['title']
	},
	{
		content: [
			'collection',
			'component',
			{
				item: {
					navigation: navigationQuery,
					Text_Content: textContentQuery,
					form: formQueryFields,
					stopover_hotel_module: stopoverHotelModuleQueryFields,
					stopover_mixed_experience_module: stopoverMixedExperienceModuleQueryFields,
					block_flight_search_form: flightSearchFormQueryFields
				}
			}
		]
	}
];

type ContentGroupSchema = z.infer<typeof contentGroupSchema>;

type ContentGroupContent = z.infer<typeof contentGroupContentSchema>;

type ContentGroupItems = z.infer<typeof contentGroupItems>;

const isContentGroupSchema = (value: unknown): value is ContentGroupSchema =>
	contentGroupSchema.safeParse(value).success;

export { contentGroupSchema, isContentGroupSchema, contentGroupQueryFields };

export type { ContentGroupSchema, ContentGroupContent, ContentGroupItems };
