import { getData as getDataFromDirectus, type DirectusDataKeys } from "$lib/directus"

type RequestBody = Record<string, string | number | boolean | undefined | null>

const getData = async<T extends DirectusDataKeys>(key: T, body: RequestBody) => await getDataFromDirectus( key, body )

export type {
   RequestBody
}

export {
  getData
}