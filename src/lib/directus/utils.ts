import { DIRECTUS_REST_URL, DIRECTUS_TOKEN } from "$env/static/private"
import { readItem, readItems, type QueryItem } from "@directus/sdk"
import { getClient } from "./client"
import type { Schema } from "./schema"

const getItem = <T>(collection: keyof Schema, id: string | number, query: QueryItem<Schema, T>) => {
  const client = getClient( DIRECTUS_REST_URL, DIRECTUS_REST_URL )
  return client.request( readItem( collection, id, query ) )
}

const getItems = < T >( collection: keyof Schema, query: QueryItem< Schema, T > ) => {
  const client = getClient( DIRECTUS_REST_URL, DIRECTUS_TOKEN )
  return client.request( readItems( collection, query ) )
}

export {
  getItem,
  getItems
}