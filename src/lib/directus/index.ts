import { type HotelSchema } from "./hotels"
import { type PageSchema } from "./page"
import { type PlaceSchema } from "./place-to-visit"
import { type RestaurantSchema } from "./restaurants"
import { getSiteSettings, type SiteSettingsSchema } from "./site-settings"
import type { DirectusRequestBody } from "./utils"
import { filter, head, includes, isNil, keys, pipe } from "ramda"
import { CATEGORIES_MAP } from "$env/static/private"
import { say } from "$lib/utils"
import { getSections, type SectionSchema } from "./section"
import { getPage } from "./pageRequest"
import { getHotel } from "./hotelRequests"
import { getRestaurant } from "./restaurantRequest"
import { getPlace } from "./placeRequest"
import { getPublishedTours } from "./tours"

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
  'stopover_place_to_visit': getPlace,
  'stopover_tour': getPublishedTours,
} as const

const isDirectusDataKey = (value: unknown): value is DirectusDataKeys => includes(value, keys(keyToDataMap));

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
  getData
}


export type {
  KeyToTypeMap,
  DirectusDataKeys
}