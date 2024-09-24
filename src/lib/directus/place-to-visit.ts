import { z } from "zod";
import { filesSchema, getItems, locationSchema, type DirectusRequestBody } from "./utils";
import { say } from "$lib/utils";
import { isNil } from "ramda";
import { textContentQuery, textContentSchema } from "./text-content";

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
  gallery: filesSchema.array(),
  translations: placeTranslationsSchema.array(),
  promo_code: z.string().nullish(),
  promo_discount_amount: z.string().nullish(),
  promo_discount_percent: z.number().nullish(),
  supported_languages: z.string().array().nullish(),
  experiences: textContentSchema.array().nullish(),
  duration: z.string(),
  pilar: z.string(),
  category: z.string().array(),
  location: locationSchema
})

type PlaceSchema = z.infer<typeof placeSchema>

const isPlaceSchema = (value: unknown): value is PlaceSchema => placeSchema.safeParse(value).success

const getPlace = async (filters: DirectusRequestBody) => {
  const { article } = filters

  if (!article || typeof article !== 'string'){
    say('Article is required to and a string get the place to visit', article)
    return null
  }

  const directusPlaceRequest = await getItems('stopover_place_to_visit', {
    fields: [
      'main_image',
      'promo_code',
      'promo_discount_amount',
      'promo_discount_percent',
      'supported_languages',
      'duration',
      'pilar',
      'category',
      'location',
      { 'experiences': textContentQuery },
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
  })

  if(isNil(directusPlaceRequest))
    return null

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