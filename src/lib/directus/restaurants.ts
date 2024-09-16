import { z } from "zod";
import { articleToWordString, getItems, type DirectusRequestBody } from "./utils";
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
  gallery: z.string(),
  translations: restaurantTranslationsSchema.array(),
  promo_code: z.string().nullish(),
  promo_discount_amount: z.number().nullish(),
  promo_discount_percent: z.number().nullish(),
  whatsapp: z.string(),
  booking_email: z.string(),
  supported_languages: z.any().array(), // fix
  type: z.any().array(), //fix
  meals: z.any().array(),
  cuisines: z.any().array(),
  schedule: z.any().array(),
  location: z.any() //fix
})

type RestaurantSchema = z.infer<typeof restaurantSchema>

const isRestaurantSchema = (value: unknown) => restaurantSchema.safeParse(value).success

const getRestaurant = async (filters: DirectusRequestBody) => {
  const { article } = filters

  if (!article || typeof article !== 'string'){
    say('Article is required to and a string get the restaurant', article)
    return null
  }

  const directusRestaurantRequest = await getItems('stopover_restaurants', {
    fields: ['*', '*.*'],
    filter: {
      translations: {
        name: {
          _icontains: articleToWordString(article)
        }
      }
    },
  })

  if(isNil(directusRestaurantRequest))
    return null

  say('Hotels Returned', directusRestaurantRequest)

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