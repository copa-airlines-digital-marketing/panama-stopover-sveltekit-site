import type { ZodObject, ZodRawShape } from "zod"
import { getHotel, hotelSchema, isHotelSchema, type HotelSchema } from "./hotels"
import { getPage, isPageSettings, pageSchema, type PageSchema } from "./page"
import { getPlace, isPlaceSchema, placeSchema, type PlaceSchema } from "./place-to-visit"
import { getRestaurant, isRestaurantSchema, restaurantSchema, type RestaurantSchema } from "./restaurants"
import { getSiteSettings, isSiteSettings, siteSettingSchema, type SiteSettingsSchema } from "./site-settings"
import type { DirectusRequestBody } from "./utils"
import { filter, head, includes, isNil, keys, pipe } from "ramda"
import { CATEGORIES_MAP } from "$env/static/private"
import { say } from "$lib/utils"
import { getSections, isSectionSchema, sectionSchema, type SectionSchema } from "./section"

type KeyToTypeMap = {
  'site-settings': SiteSettingsSchema,
  'page': PageSchema,
  'sections': SectionSchema[],
  'stopover_hotels': HotelSchema,
  'stopover_restaurants': RestaurantSchema,
  'stopover_place_to_visit': PlaceSchema
}

type DirectusDataKeys = keyof KeyToTypeMap

const keyToDataMap: Record<DirectusDataKeys, (body: DirectusRequestBody) => Promise<KeyToTypeMap[DirectusDataKeys] | null> > = {
  'site-settings': getSiteSettings,
  'page': getPage,
  'sections': getSections,
  'stopover_hotels': getHotel,
  'stopover_restaurants': getRestaurant,
  'stopover_place_to_visit': getPlace
} as const


const isDirectusDataKey = (value: unknown): value is DirectusDataKeys => includes(value, keys(keyToDataMap))

const keyToValidationMap: Record<DirectusDataKeys, (value: unknown) => boolean > = {
  'site-settings': isSiteSettings,
  'page': isPageSettings,
  'sections': isSectionSchema,
  'stopover_hotels': isHotelSchema,
  'stopover_restaurants': isRestaurantSchema,
  'stopover_place_to_visit': isPlaceSchema
}

const keyToSchemaMap: Record<DirectusDataKeys, ZodObject<ZodRawShape>> = {
  'site-settings': siteSettingSchema,
  'page': pageSchema,
  'sections': sectionSchema,
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
  KeyToTypeMap,
  DirectusDataKeys
}