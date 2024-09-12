import { getPage } from "./page"
import { getSiteSettings } from "./site-settings"
import type { DirectusRequestBody } from "./utils"

const keyToDataMap = {
  'site-settings': getSiteSettings,
  'page': getPage
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