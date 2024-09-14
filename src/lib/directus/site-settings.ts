import { z } from 'zod'
import { logoQuery, logosSchema } from './logos'
import { getItem, getTranslationFilter, type DirectusRequestBody } from './utils'
import { SITE_ID } from '$env/static/private'
import { textContentQuery, textContentSchema } from './text-content'

const environmentStatusSchema = z.object({
  environment: z.string(),
  state: z.string()
}).array()

const siteErrorMessages = z.object({
  Text_Content_id: textContentSchema,
  error_code: z.number()
})

const pagePathSchema = z.object({
  translations: z.array(z.object({
    path: z.string()
  })),
  parent: z.lazy(() => pagePathSchema).nullish()
})

const articleAssociationSchema = z.object({
  collection: z.string(),
  pages_id: pagePathSchema
})

const siteSettingSchema = z.object({
  id: z.optional(z.number()),
  environmet_status: environmentStatusSchema,
  favIcon: logosSchema,
  logo: logosSchema,
  head_code: z.string().nullable(),
  start_of_body_code: z.string().nullable(),
  end_of_body_code: z.string().nullable(),
  maintenance_message: z.nullable(textContentSchema),
  coming_soon_message: z.nullable(textContentSchema),
  error_messages: z.nullable(siteErrorMessages.array()),
  articles_association: articleAssociationSchema.array().nullish()
})

type SiteSettingsSchema = z.infer<typeof siteSettingSchema>

const isSiteSettings = (value: unknown): value is SiteSettingsSchema => siteSettingSchema.safeParse(value).success

const translationPath = { 'translations': ['path'] }

const getSiteSettings = async (filters: DirectusRequestBody) => {

  const translationFilter = getTranslationFilter(filters.locale)
  
  const siteSettings = await getItem<SiteSettingsSchema>( 'sites', SITE_ID,  {
    fields: [
      'environmet_status',
      'head_code',
      'start_of_body_code',
      'end_of_body_code',
      {'articles_association': [
        'collection',
        { 'pages_id': [
          translationPath,
          { 'parent': [
            translationPath,
            { 'parent': [translationPath] }
          ]}
        ]}
      ]},
      { 'favIcon': logoQuery }, 
      { 'logo': logoQuery }, 
      { 'maintenance_message': textContentQuery },
      { 'coming_soon_message': textContentQuery },
      { 'error_messages': [
          'error_code',
          { 'Text_Content_id': textContentQuery }
        ]
      }
    ],
    deep: {
      'articles_association': {
        pages_id: {
          ...translationFilter,
          parent: {
            ...translationFilter,
            parent:{
              ...translationFilter
            }
          }
        },
      },
      'maintenance_message': translationFilter,
      'coming_soon_message': translationFilter,
      'error_messages': {
        'Text_Content_id': translationFilter
      }
    }
  })

  if(!isSiteSettings(siteSettings))
    return null
  
  return siteSettings
}

export {
  siteSettingSchema,
  getSiteSettings,
  isSiteSettings,
}

export type {
  SiteSettingsSchema
}