import { z } from "zod";
import { sectionSchema } from "./section";
import { getItems, getTranslationFilter, type DirectusRequestBody } from "./utils";
import { textContentQuery } from "./text-content";
import { logoQuery } from "./logos";
import { isNil, toString } from "ramda";

const pageTranslationsSchema = z.object({
  languages_code: z.string().optional(),
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

const getTranslatedPageFilter = (locale: string | number, path: string | number ) => ({
  'translations': {
    '_and': [
      { 'languages_code': { '_eq':locale } },
      { 'path': { '_eq': path } }
    ]
  }
})

const getPageFilter = (locale: string | number, category?: string | number, subcategory?: string | number, article?: string | number) => {
  
  const base = getTranslatedPageFilter(locale, '/')

  const result = {
    ...base
  }

  if (category)
    result.parent = getTranslatedPageFilter(locale, category)

  if (subcategory) 
    result.parent.parent = getTranslatedPageFilter(locale, subcategory)
  
  if (article)
    result.parent.parent.parent = getTranslatedPageFilter(locale, article)

  return result
  
}

const isPageSettings = (value: unknown): value is PageSchema => pageSchema.safeParse(value).success

const getPage = async (filters: DirectusRequestBody) => {

  const val = getPageFilter(filters.locale, filters.category, filters.subcategory, filters.article)
  console.log(toString(val))
  const pageRequest = await getItems<PageSchema>('pages', {
    fields: [
      'id',
      'share_image',
      'index',
      'head_code',
      'start_of_body_code',
      'end_of_body_code',
      { 'translations': [
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
    filter: getPageFilter(filters.locale, filters.category, filters.subcategory, filters.article),
    deep: {
      storefronts: {
        _filter: {
          storefronts_code: {
            _eq: filters.storefront
          }
        },
        sections: {
          section_content: {
            "item:Text_Content": getTranslationFilter(filters.locale),
            "item:navigation": getTranslationFilter(filters.locale),
          }
        }
      },

    }
  })

  if(isNil(pageRequest))
    return null

  const firstPage = pageRequest[0]

  console.log('page request', pageSchema.safeParse(firstPage).error)

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