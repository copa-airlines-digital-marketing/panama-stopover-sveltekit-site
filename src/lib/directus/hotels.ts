import { z } from "zod";
import { filesSchema, getItems, locationSchema, type DirectusRequestBody } from "./utils";
import { say } from "$lib/utils";
import { isNil } from "ramda";
import type { QueryItem } from "@directus/sdk";
import type { Schema } from "./schema";
import { getHotelAmenities } from "./hotel-amenities";
import { pagePathFields, pathSchema } from "./page";

const hotelTranslationsSchema = z.object({
  lang_code: z.string(),
  name: z.string(),
  description: z.string(),
  url: z.string().nullish(),
  promo_name: z.string().nullish(),
  promo_description: z.string().nullish(),
  path: z.string().nullish()
})

const hotelSchema = z.object({
  main_image: z.string(),
  promo_code: z.string().nullish(),
  promo_discount_amount: z.string().nullish(),
  promo_discount_percent: z.number().nullish(),
  phone_number: z.string(),
  booking_email: z.string(),
  supported_languages: z.string().array(),
  includes: z.string().array(),
  stars: z.number(),
  location: locationSchema,
  gallery: filesSchema.array(),
  translations: hotelTranslationsSchema.array(),
  parent_page: pathSchema.optional()
})

type HotelSchema = z.infer<typeof hotelSchema>

const isHotelSchema = (value: unknown): value is HotelSchema => hotelSchema.safeParse(value).success

const getHotelQuery = ({locale, category, subCategory, article}: DirectusRequestBody): QueryItem<Schema, 'stopover_hotels'> => ({
  fields: [
    'main_image',
    'promo_code',
    'promo_discount_amount',
    'promo_discount_percent',
    'phone_number',
    'booking_email',
    'supported_languages',
    'includes',
    'stars',
    'location',
    { 'gallery': ['directus_files_id', 'sort'] },
    { 'translations': [
      'lang_code',
      'name',
      'description',
      'url',
      'promo_name',
      'promo_description',
      'path'
    ]},
    { 'parent_page': pagePathFields}
  ],
  filter: {
    _and: [
      { translations: { lang_code: { _eq: locale } } },
      { translations: { path: { _eq: article} } },
      { parent_page: { translations: { languages_code: { _eq: locale } } } },
      { parent_page: { translations: { path: { _eq: subCategory } } } },
      { parent_page: { parent: { translations: { languages_code: { _eq: locale } } } } },
      { parent_page: { parent: { translations: { path: { _eq: category } } } } },
      { parent_page: { parent: { parent: {translations: { languages_code: { _eq: locale } } } } } },
      { parent_page: { parent: { parent: {translations: { path: { _eq: locale } } } } } },
    ]
  },
})

const getHotel = async (filters: DirectusRequestBody) => {
  const { article, locale } = filters

  if (!article || typeof article !== 'string'){
    say('Article is required to and a string get the hotel', filters)
    return null
  }

  if (!locale){
    say('Locale is required', filters)
    return null
  }

  const requests = await Promise.all([
    getItems('stopover_hotels', getHotelQuery(filters), filters.preview),
    getHotelAmenities(filters)
  ])
  
  const [directusHotelRequest, amenities ] = requests

  if(isNil(directusHotelRequest))
    return null
  
  if(directusHotelRequest.length > 1) {
    say('Query returned more than one result, review is required', directusHotelRequest.map(value => value.translations[0].name))
    return null
  }

  const [hotel] = directusHotelRequest

  if(!isHotelSchema(hotel)) {
    say('Hotel does not match the schema', hotelSchema.safeParse(hotel).error)
    return null
  }

  return {hotel, amenities}
}

export {
  getHotel,
  hotelSchema,
  isHotelSchema,
}

export type { 
  HotelSchema
}