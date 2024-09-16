import type { ZodObject, ZodRawShape } from "zod"
import { getHotel, hotelSchema, isHotelSchema } from "./hotels"
import { getPage, isPageSettings, pageSchema } from "./page"
import { getPlace, isPlaceSchema, placeSchema } from "./place-to-visit"
import { getRestaurant, isRestaurantSchema, restaurantSchema } from "./restaurants"
import { getSiteSettings, isSiteSettings, siteSettingSchema } from "./site-settings"
import type { DirectusRequestBody } from "./utils"
import { filter, head, includes, isNil, keys, pipe } from "ramda"
import { CATEGORIES_MAP } from "$env/static/private"
import { say } from "$lib/utils"

const keyToDataMap = {
  'site-settings': getSiteSettings,
  'page': getPage,
  'stopover_hotels': getHotel,
  'stopover_restaurants': getRestaurant,
  'stopover_place_to_visit': getPlace
} as const

type DirectusDataKeys = keyof typeof keyToDataMap

const isDirectusDataKey = (value: unknown): value is DirectusDataKeys => includes(value, keys(keyToDataMap))

const keyToValidationMap: Record<DirectusDataKeys, (value: unknown) => boolean> = {
  'site-settings': isSiteSettings,
  'page': isPageSettings,
  'stopover_hotels': isHotelSchema,
  'stopover_restaurants': isRestaurantSchema,
  'stopover_place_to_visit': isPlaceSchema
}

const keyToSchemaMap: Record<DirectusDataKeys, ZodObject<ZodRawShape>> = {
  'site-settings': siteSettingSchema,
  'page': pageSchema,
  'stopover_hotels': hotelSchema,
  'stopover_restaurants': restaurantSchema,
  'stopover_place_to_visit': placeSchema
}

const keymapFilter = (subCategory: string) => (value: string) => {
  return includes(subCategory, value)
}

const getKeyOfArticle = (subCategory: string, map: Record<DirectusDataKeys, string>): DirectusDataKeys | unknown => pipe(filter(keymapFilter(subCategory)), keys, head)(map)

const articleToKeyMap = (subCategory: string | null, article: string | null): DirectusDataKeys | null => {
  if(isNil(article) || isNil(subCategory))
    return 'page'

  try {
    const keyMap = JSON.parse(CATEGORIES_MAP)

    const key = getKeyOfArticle(subCategory, keyMap)

    if(!key || typeof key !== 'string' || !isDirectusDataKey(key))
      return 'page'

    return key
  } catch (err) {
    say('An error ocurred while identifying the table to query', err)
    return null
  }
}



const getData = async (key: DirectusDataKeys, body: DirectusRequestBody) => {
  const data = await keyToDataMap[key](body)

  return data
}

export {
  articleToKeyMap,
  getData,
  keyToSchemaMap,
  keyToValidationMap
}


export type {
  DirectusDataKeys
}