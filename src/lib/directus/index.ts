import { getSiteSettings } from "./site-settings"

const keyToDataMap = {
  'site-settings': getSiteSettings
} as const

type DirectusDataKeys = keyof typeof keyToDataMap

const getData = async (key: DirectusDataKeys, id?: string) => {
  const data = await keyToDataMap[key](id)

  return data
}

export {
  getData
}


export type {
  DirectusDataKeys
}