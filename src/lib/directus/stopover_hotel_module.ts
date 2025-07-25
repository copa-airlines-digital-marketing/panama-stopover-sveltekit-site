import { any, z } from 'zod';
import { placesPilar } from './place-to-visit';

const sortSchema = z.object({
	by: z.union([
		z.literal('promo_discount_amount'),
		z.literal('promo_discount_percent'),
		z.literal('distance_from_city'),
		z.literal('priority'),
		z.literal('stars')
	]),
	order: z.union([z.literal('asc'), z.literal('desc')])
});

const stopoverItemsCollections = z.union([
	z.literal('hotels'),
	z.literal('restaurants'),
	z.literal('activities'),
	z.literal('tours'),
	z.literal('packages'),
	z.literal('transportation'),
	z.literal('events')
]);

const stopoverHotelModuleSchema = z.object({
	collection: stopoverItemsCollections,
	sort: sortSchema.array().nullable(),
	max_items: z.number(),
	highlight_only: z.boolean(),
	promo_only: z.boolean(),
	pilar: placesPilar.array().nullable(),
	items: any().array().optional()
});

const stopoverHotelModuleQueryFields = [
	'collection',
	'highlight_only',
	'max_items',
	'pilar',
	'promo_only',
	'sort'
];

type StopoverHotelModuleSchema = z.infer<typeof stopoverHotelModuleSchema>;

const isStopoverModuleSchema = (value: unknown): value is StopoverHotelModuleSchema =>
	stopoverHotelModuleSchema.safeParse(value).success;

export { stopoverHotelModuleSchema, isStopoverModuleSchema, stopoverHotelModuleQueryFields };

export type { StopoverHotelModuleSchema };
