import { z } from "zod";
import { filesSchema, getItems, locationSchema, type DirectusRequestBody } from "./utils";
import { say } from "$lib/utils";
import { isNil } from "ramda";

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
  gallery: filesSchema.array(),
  translations: hotelTranslationsSchema.array(),
  promo_code: z.string().nullish(),
  promo_discount_amount: z.string().nullish(),
  promo_discount_percent: z.number().nullish(),
  phone_number: z.string(),
  booking_email: z.string(),
  supported_languages: z.string().array(),
  includes: z.string().array(),
  stars: z.number(),
  location: locationSchema
})

type HotelSchema = z.infer<typeof hotelSchema>

const isHotelSchema = (value: unknown): value is HotelSchema => hotelSchema.safeParse(value).success

const getHotel = async (filters: DirectusRequestBody) => {
  const { article } = filters

  if (!article || typeof article !== 'string'){
    say('Article is required to and a string get the hotel', article)
    return null
  }

  const directusHotelRequest = await getItems('stopover_hotels', {
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
        'promo_description'
      ]}
    ],
    filter: {
      _and: [
        { translations: { lang_code: { _eq: filters.locale } } },
        { translations: { path: { _eq: article} } }
      ]
    },
  }, filters.preview)

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

  return hotel
}

export {
  getHotel,
  hotelSchema,
  isHotelSchema,
}

export type { 
  HotelSchema
}