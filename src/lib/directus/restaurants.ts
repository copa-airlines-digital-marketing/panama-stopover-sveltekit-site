import { z } from "zod";
import { filesSchema, getItems, locationSchema, type DirectusRequestBody } from "./utils";
import { say } from "$lib/utils";
import { isNil } from "ramda";

const restaurantTranslationsSchema = z.object({
  lang_code: z.string(),
  name: z.string(),
  description: z.string(),
  url: z.string().nullish(),
  promo_name: z.string().nullish(),
  promo_description: z.string().nullish()
})

const restaurantSchema = z.object({
  main_image: z.string(),
  gallery: filesSchema.array(),
  translations: restaurantTranslationsSchema.array(),
  promo_code: z.string().nullish(),
  promo_discount_amount: z.string().nullish(),
  promo_discount_percent: z.number().nullish(),
  whatsapp: z.string().nullish(),
  supported_languages: z.string().array(),
  type: z.string().array(),
  meals: z.string().array(),
  cuisines: z.string().array(),
  location: locationSchema
})

type RestaurantSchema = z.infer<typeof restaurantSchema>

const isRestaurantSchema = (value: unknown): value is RestaurantSchema => restaurantSchema.safeParse(value).success

const getRestaurant = async (filters: DirectusRequestBody) => {
  const { article } = filters

  if (!article || typeof article !== 'string'){
    say('Article is required to and a string get the restaurant', article)
    return null
  }

  const directusRestaurantRequest = await getItems('stopover_restaurants', {
    fields: [
      'main_image',
      'promo_code',
      'promo_discount_amount',
      'promo_discount_percent',
      'whatsapp',
      'supported_languages',
      'type',
      'meals',
      'cuisines',
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
        { translations: {path: { _eq: article} } }
      ]
    },
  }, filters.preview)

  if(isNil(directusRestaurantRequest))
    return null

  if(directusRestaurantRequest.length > 1) {
    say('Query returned more than one result, review is required', directusRestaurantRequest.map(value => value.translations.name))
    return null
  }

  const [restaurant] = directusRestaurantRequest

  if(!isRestaurantSchema(restaurant)) {
    say('Restaurant does not match the schema', restaurantSchema.safeParse(restaurant).error)
    return null
  }

  return restaurant
}

export {
  getRestaurant,
  restaurantSchema,
  isRestaurantSchema,
}

export type { 
  RestaurantSchema
}