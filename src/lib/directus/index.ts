import { say } from "$lib/utils"
import { getHotel } from "./hotels"
import { getPage } from "./page"
import { getPlace } from "./place-to-visit"
import { getRestaurant } from "./restaurants"
import { getSiteSettings } from "./site-settings"
import type { DirectusRequestBody } from "./utils"

const keyToDataMap = {
  'site-settings': getSiteSettings,
  'page': getPage,
  'stopover_hotels': getHotel,
  'stopover_restarants': getRestaurant,
  'stopover_place_to_visit': getPlace
} as const

type DirectusDataKeys = keyof typeof keyToDataMap


const getData = async (key: DirectusDataKeys, body?: DirectusRequestBody) => {
  const data = await keyToDataMap[key](body)

  return data
}

export {
  getData
}


export type {
  DirectusDataKeys
}