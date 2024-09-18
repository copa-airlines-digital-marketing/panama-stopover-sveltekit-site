import { z } from "zod";
import { getItems, getTranslationFilter, type DirectusRequestBody } from "./utils";
import { isEmpty, isNil } from "ramda";
import { say } from "$lib/utils";

const pageTranslationsSchema = z.object({
  languages_code: z.string(),
  path: z.string(),
  title_tag: z.string(),
  meta_description: z.string()
})

const pageSchema = z.object({
  id: z.number(),
  share_image: z.string(),
  translations: pageTranslationsSchema.array(),
  index: z.boolean(),
  head_code: z.string().nullish(),
  start_of_body_code: z.string().nullish(),
  end_of_body_code: z.string().nullish(),
})

type PageSchema = z.infer<typeof pageSchema>

type NullishID = null | number | string | undefined

const getTranslatedPageFilterRecursive = (locale: NullishID, path: NullishID, totalParents: number ) => {
  if (totalParents < 1) 
    return ([
      {
        'translations': {
          'languages_code': { '_eq':locale }
        },
      },
      {
        'translations': {
          'path': { '_eq':path }
        },
      }
    ])
  
  return getTranslatedPageFilterRecursive(locale, path, totalParents - 1 ).map(value => ({parent: value}))
} 

const getPageFilter = ( filter: DirectusRequestBody ) => {

  const { locale, home, category, subCategory } = filter
  
  const base = {
    _and: [
      ...getTranslatedPageFilterRecursive(locale, '/', 0)
    ]
  }

  let result = base

  if (home)
    result = {
      _and: [
        ...getTranslatedPageFilterRecursive(locale, '/', 1),
        ...getTranslatedPageFilterRecursive(locale, locale, 0),
      ]
    }

  if (category)
    result = {
      _and: [
        ...getTranslatedPageFilterRecursive(locale, '/', 2),
        ...getTranslatedPageFilterRecursive(locale, locale, 1),
        ...getTranslatedPageFilterRecursive(locale, category, 0),
      ]
    }

  if (subCategory) 
    result = {
      _and: [
        ...getTranslatedPageFilterRecursive(locale, '/', 3),
        ...getTranslatedPageFilterRecursive(locale, locale, 2),
        ...getTranslatedPageFilterRecursive(locale, category, 1),
        ...getTranslatedPageFilterRecursive(locale, subCategory, 0)
      ]
    }

  return result
  
}

const isPageSettings = (value: unknown): value is PageSchema => pageSchema.safeParse(value).success

const getPage = async (filters: DirectusRequestBody) => {

  const pageRequest = await getItems<PageSchema>('pages', {
    fields: [
      'id',
      'share_image',
      'index',
      'head_code',
      'start_of_body_code',
      'end_of_body_code',
      { 'translations': [
        'languages_code',
        'path',
        'title_tag',
        'meta_description'
      ]}
    ],
    filter: getPageFilter(filters)
  })

  if(isNil(pageRequest) || isEmpty(pageRequest)){
    say('request to directus returned a nil or empty item', pageRequest)
    return null
  }

  if(!pageSchema.array().safeParse(pageRequest).success){
    say('request is not an array of pages', {pageRequest, errors:pageSchema.safeParse(pageRequest).error})
    return null
  }

  if(Array.isArray(pageRequest) && pageRequest.length > 1) {
    say('request returned more than one page please check in directus', {filters, id: pageRequest.map(p => p.id)})
    return null
  }

  const firstPage = pageRequest[0]

  if(!isPageSettings(firstPage)){
    say('first page does not comply with the schema', { filters, firstPage })
    return null
  }

  return firstPage
}

export {
  pageSchema,
  getPage,
  isPageSettings
}

export type {
  PageSchema
}