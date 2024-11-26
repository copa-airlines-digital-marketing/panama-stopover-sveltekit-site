import { say } from "$lib/utils";
import { all, flatten, forEach, isNil, isNotNil, keys, map, values } from "ramda";
import { getItems, type DirectusRequestBody } from "../utils";
import type { ZodSchema } from "zod";
import type { Schema } from "../schema";
import type { QueryItem } from "@directus/sdk";

type SchemaKeys = keyof Schema

type collectionSchema = Record<SchemaKeys, {
    schema: ZodSchema,
    query: QueryItem<Schema, SchemaKeys>
}>

const ifIsNulReportIt = (object: Record<string, unknown>) => (key: string) => {
    if (isNil(object[key])) return say(`${key} is required in request`, object)
}

const isValidArticlePath = (filters: DirectusRequestBody): boolean => {
    const { locale, category, subCategory, article } = filters

    const fields = { locale, category, subCategory, article }

    if (all(isNotNil, values(fields)))
        return true

    forEach(ifIsNulReportIt(filters), keys(fields))

    return false
}

const isValidateDirectusResponse = <T>(response: unknown, schema: ZodSchema<T>): response is T => {
    const parse = schema.safeParse(response)

    if(parse.error)
        say('response does not comply with schema', {response, schema})
    
    return isNil(parse.error)
}

const getRequestFromCollectionSchema = (collectionSchema: collectionSchema, preview: string | number | null | undefined) => (key: SchemaKeys) => getItems(key, collectionSchema[key].query, preview)

const getArticle = async (collectionSchema: collectionSchema, filters: DirectusRequestBody) => {
    const { preview } = filters

    if(!isValidArticlePath(filters))
        return null

    const request = await Promise.all(map(getRequestFromCollectionSchema(collectionSchema, preview), keys(collectionSchema)))

    const [tour] = request 

    if (isValidateDirectusResponse(tour, tourSchema))
        return {tour}

    return null
}

export {
    isValidArticlePath,
    isValidateDirectusResponse,
}