import { getSiteSettings } from "./site-settings"

const keyToDataMap = {
  'site-settings': getSiteSettings
} as const

type DirectusDataKeys = keyof typeof keyToDataMap

const getData = (key: DirectusDataKeys, id?: string) => {
  return keyToDataMap[key](id)
}

export {
  getData
}


export type {
  DirectusDataKeys
}