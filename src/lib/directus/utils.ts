import { DIRECTUS_REST_URL, DIRECTUS_TOKEN } from "$env/static/private"
import { readItem, readItems, type QueryItem } from "@directus/sdk"
import { getClient } from "./client"
import type { Schema } from "./schema"

type DirectusRequestBody = Record<string, string | number | undefined | null>

const getItem = async <T>(collection: keyof Schema, id: string | number, query: QueryItem<Schema, T>) => {
  try {
    const client = getClient( DIRECTUS_REST_URL, DIRECTUS_TOKEN )
    const request = await client.request( readItem( collection, id, query ) )
    return request
  } catch (error) {
    console.log(`error while getting item: ${id} from collection: ${collection}`, error)
    return null
  }
}

const getItems = async < T >( collection: keyof Schema, query: QueryItem< Schema, T > ) => {
  try {
    const client = getClient( DIRECTUS_REST_URL, DIRECTUS_TOKEN )
    const request = await client.request( readItems( collection, query ) )
    return request
  } catch (error) {
    console.log(`error while getting items from collection: ${collection}`, error)
    return null
  }
}

const getTranslationFilter = (locale: string | number) =>  ({
  'translations': {
    _filter:{
      'languages_code':{
        '_eq': locale
      }
    }
  }
})

export {
  getItem,
  getItems,
  getTranslationFilter
}

export type {
  DirectusRequestBody
}