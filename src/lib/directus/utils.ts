import { DIRECTUS_REST_URL, DIRECTUS_TOKEN } from "$env/static/private"
import { readItem, type QueryItem } from "@directus/sdk"
import { getClient } from "./client"
import type { Schema } from "./schema"

const getItem = <T>(collection: string, id: string | number, query: QueryItem<Schema, T>) => {
  const client = getClient(DIRECTUS_REST_URL, DIRECTUS_TOKEN)
  const getItemValue = client.request(readItem(collection, id, query))
}