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
	z.literal('hotel'),
	z.literal('stopover_hotels'),
	z.literal('stopover_hotel'),
	z.literal('restaurants'),
	z.literal('restaurant'),
	z.literal('stopover_restaurants'),
	z.literal('stopover_restaurant'),
	z.literal('activities'),
	z.literal('activity'),
	z.literal('stopover_place_to_visit'),
	z.literal('stopover_places_to_visit'),
	z.literal('stopover_activity'),
	z.literal('stopover_activities'),
	z.literal('tours'),
	z.literal('tour'),
	z.literal('stopover_tour'),
	z.literal('stopover_tours'),
	z.literal('packages'),
	z.literal('package'),
	z.literal('stopover_package'),
	z.literal('stopover_packages'),
	z.literal('transportation'),
	z.literal('transport'),
	z.literal('stopover_transportation'),
	z.literal('stopover_transport'),
	z.literal('events')
]);

const stopoverHotelModuleSchema = z.object({
	collection: stopoverItemsCollections,
	sort: sortSchema.array().nullable().optional(),
	max_items: z.number().optional(),
	highlight_only: z.boolean().optional(),
	promo_only: z.boolean().optional(),
	pilar: placesPilar.array().nullable().optional(),
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
