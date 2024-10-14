import { z } from "zod";

const sortSchema = z.object({
  by: z.union([
    z.literal('promo_discount_amount'),
    z.literal('promo_discount_percent'), 
    z.literal('distance_from_city'),
    z.literal('priority'),
    z.literal('stars'),
  ]),
  order: z.union([z.literal('asc'), z.literal('desc')])
})

const stopoverHotelModuleSchema = z.object({
  sort: sortSchema.array().nullable(),
  max_items: z.number(),
  highlight_only: z.boolean(),
})

const stopoverHotelModuleQueryFields = [
  'sort',
  'max_items',
  'highlight_only'
]

type StopoverHotelModuleSchema = z.infer<typeof stopoverHotelModuleSchema>

export {
  stopoverHotelModuleSchema,
  stopoverHotelModuleQueryFields
}

export type {
  StopoverHotelModuleSchema
}