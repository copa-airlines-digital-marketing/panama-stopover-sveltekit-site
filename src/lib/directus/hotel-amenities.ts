import { z } from "zod";
import { logoQuery, logosSchema } from "./logos";
import { getItems, getTranslationFilter, type DirectusRequestBody } from "./utils";
import type { QueryItem } from "@directus/sdk";
import type { Schema } from "./schema";
import { say } from "$lib/utils";

const hotelAmenityTranslation = z.object({
  languages_code: z.string().optional(),
  name: z.string()
})

const hotelAmenities = z.object({
  name: z.string(),
  icon: logosSchema,
  translations: hotelAmenityTranslation.array()
})

type HotelAmenity = z.infer<typeof hotelAmenities>

const hotelAmenityQuery = (locale: string | number): QueryItem<Schema, 'hotel_amenities'> => ({ 
  fields: [ 
    'name', 
    { 'icon': logoQuery }, 
    { 'translations': ['name'] }
  ],
  deep: {
    ...getTranslationFilter(locale)
  }
})

const isHotelAmenitiesArray = (value: unknown): value is HotelAmenity => hotelAmenities.array().safeParse(value).success

const getHotelAmenities = async (filters: DirectusRequestBody) => {

  const { locale } = filters

  if(!locale) {
    say('locale is required:', filters)
    return null
  }

  const request = await getItems('hotel_amenities', hotelAmenityQuery(locale), null)

  if (isHotelAmenitiesArray(request))
    return request

  say('Hotel Amenities does not match the requested format',hotelAmenities.array().safeParse(request).error)

  return null
}

export {
  getHotelAmenities
}

export type {
  HotelAmenity
}