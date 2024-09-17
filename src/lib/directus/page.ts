import { z } from "zod";
import { sectionSchema } from "./section";
import { getItems, getTranslationFilter, type DirectusRequestBody } from "./utils";
import { textContentQuery } from "./text-content";
import { logoQuery } from "./logos";
import { isNil } from "ramda";

const pageTranslationsSchema = z.object({
  languages_code: z.string(),
  path: z.string(),
  title_tag: z.string(),
  meta_description: z.string()
})

const pageStorefrontSection = z.object({
  sections_id: sectionSchema
})

const pageStorefront = z.object({
  storefronts_code: z.string().optional(),
  sections: pageStorefrontSection.array().nullish()
})

const pageSchema = z.object({
  id: z.number(),
  share_image: z.string(),
  translations: pageTranslationsSchema.array(),
  index: z.boolean(),
  head_code: z.string().nullish(),
  start_of_body_code: z.string().nullish(),
  end_of_body_code: z.string().nullish(),
  storefronts: pageStorefront.array(),
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
      ] },
      { 'storefronts': [
        { 'sections': [{
          'sections_id': [
            'id',
            'landmark',
            'section_id',
            'horizontal_behaviour',
            'content_spacing',
            'content_horizontal_alignment',
            'content_horizontal_distribution',
            'content_vertical_alignment',
            'content_vertical_distribution',
            'background_color',
            { 'section_content': [
              'id',
              'collection',
              'component_name',
              'display',
              'theme',
              'horizontal_alignment',
              'vertical_alignment',
              { 'item': {
                'navigation': [
                  { 'icon': logoQuery },
                  { 'translations': [
                    'title',
                    'items'
                  ] }
                ],
                'Text_Content': textContentQuery,
              } }
            ]}
          ]
        }] }
      ] }
    ],
    filter: getPageFilter(filters),
    deep: {
      storefronts: {
        _filter: {
          storefronts_code: {
            _eq: filters.storefront
          }
        },
        sections: {
          sections_id:{
            section_content: {
              "item:Text_Content": getTranslationFilter(filters.locale),
              "item:navigation": getTranslationFilter(filters.locale),
            }
          }
        }
      },

    }
  })

  if(isNil(pageRequest))
    return null

  const firstPage = pageRequest[0]

  if(!isPageSettings(firstPage))
    return null

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