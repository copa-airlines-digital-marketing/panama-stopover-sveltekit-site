import type { HotelSchema } from "$lib/directus/hotels";
import type { PageSchema, PathSchema } from "$lib/directus/page";
import type { PlaceSchema } from "$lib/directus/place-to-visit";
import type { RestaurantSchema } from "$lib/directus/restaurants";
import { curry, filter, isNotNil, map, mergeWith, replace } from "ramda";

type DirectusItem = PageSchema | HotelSchema | RestaurantSchema | PlaceSchema

const concatWithSlash = curry((a: string, b: string) => `${a}/${b}`)

const isValidTranslation = (value: string) => value.includes('/') && !value.includes('null') && !value.includes('undefined')

const getPageNameRecursive = (item: PathSchema) =>  {
  let parentPath: Record<string, string> = {}
  if(isNotNil(item.parent))
    parentPath = getPageNameRecursive(item.parent)

  const translatedPath = item.translations.reduce((a,c) => ({ ...a, [c.languages_code]: c.title_tag }), <Record<string,string>>{})

  return mergeWith(concatWithSlash, parentPath, translatedPath)
}


const getBreadcrumNames = (item: DirectusItem) => {
  const currentName = item.translations.reduce((a, c) => ({...a, [c.languages_code || c.lang_code]: c.name || c.title_tag }), {})

  const parentNames = getPageNameRecursive(item.parent_page || item.parent)

  return filter(isValidTranslation,mergeWith(concatWithSlash, parentNames, currentName))
}

const getPathRecursive = (item: PathSchema ) => {
  let parentPath: Record<string, string> = {}
  if(isNotNil(item.parent))
    parentPath = getPathRecursive(item.parent)

  const translatedPath = item.translations.reduce((a,c) => ({...a, [c.languages_code]: c.path}), <Record<string,string>>{})

  return mergeWith(concatWithSlash, parentPath, translatedPath)
}

const getCannonicals = (item: DirectusItem ) => {
  const currentPaths = item.translations.reduce((a,c) => ({...a, [c.languages_code || c.lang_code]: c.path}), {})
  
  const parentPath = map(replace(/\/\//g, '/') ,getPathRecursive(item.parent_page || item.parent))

  const cannonicals = map(replace(/\/\//g, '/'), mergeWith(concatWithSlash,parentPath, currentPaths))

  return filter(isValidTranslation, cannonicals)
}

export {
  getPathRecursive,
  getCannonicals,
  getBreadcrumNames
}