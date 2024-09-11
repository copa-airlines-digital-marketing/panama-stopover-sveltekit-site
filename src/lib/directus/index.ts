import { getSiteSettings } from "./site-settings"
import type { DirectusRequestBody } from "./utils"

const keyToDataMap = {
  'site-settings': getSiteSettings
} as const

type DirectusDataKeys = keyof typeof keyToDataMap


const getData = async (key: DirectusDataKeys, body?: DirectusRequestBody, id?: string) => {
  const data = await keyToDataMap[key](body)

  return data
}

export {
  getData
}


export type {
  DirectusDataKeys
}