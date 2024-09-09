const keyToDataMap = {
  'site-settings': () => {}
} as const

type DirectusDataKeys = keyof typeof keyToDataMap

const getData = (key: DirectusDataKeys, id?: string) => {
  return keyToDataMap[key]()
}

export {
  getData
}


export type {
  DirectusDataKeys
}