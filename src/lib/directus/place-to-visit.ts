import { z } from "zod";
import { articleToWordString, getItems, type DirectusRequestBody } from "./utils";
import { say } from "$lib/utils";
import { isNil } from "ramda";
import { textContentSchema } from "./text-content";

const placeTranslationsSchema = z.object({
  lang_code: z.string(),
  name: z.string(),
  description: z.string(),
  url: z.string().nullish(),
  promo_name: z.string().nullish(),
  promo_description: z.string().nullish()
})

const placeSchema = z.object({
  main_image: z.string(),
  gallery: z.string(),
  translations: placeTranslationsSchema.array(),
  promo_code: z.string().nullish(),
  promo_discount_amount: z.number().nullish(),
  promo_discount_percent: z.number().nullish(),
  whatsapp: z.string(),
  booking_email: z.string(),
  supported_languages: z.any().array().nullish(), // fix
  experiences: textContentSchema.array().nullish(),
  duration: z.string(),
  pilar: z.string(),
  category: z.any().array(),
  location: z.any() //fix
})

type PlaceSchema = z.infer<typeof placeSchema>

const isPlaceSchema = (value: unknown) => placeSchema.safeParse(value).success

const getPlace = async (filters: DirectusRequestBody) => {
  const { article } = filters

  if (!article || typeof article !== 'string'){
    say('Article is required to and a string get the place to visit', article)
    return null
  }

  const directusPlaceRequest = await getItems('stopover_place_to_visit', {
    fields: ['*', '*.*'],
    filter: {
      translations: {
        name: {
          _icontains: articleToWordString(article)
        }
      }
    },
  })

  if(isNil(directusPlaceRequest))
    return null

  say('Place Returned', directusPlaceRequest)

  if(directusPlaceRequest.length > 1) {
    say('Query returned more than one result, review is required', directusPlaceRequest.map(value => value.translations.name))
    return null
  }

  const [place] = directusPlaceRequest

  if(!isPlaceSchema(place)) {
    say('Place to visit does not match the schema', placeSchema.safeParse(place).error)
    return null
  }

  return place
}

export {
  getPlace,
  placeSchema,
  isPlaceSchema,
}

export type { 
  PlaceSchema
}