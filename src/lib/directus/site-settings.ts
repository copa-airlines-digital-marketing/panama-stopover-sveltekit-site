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
  error_messages: z.nullable(siteErrorMessages.array())
})

type SiteSettingsSchema = z.infer<typeof siteSettingSchema>

const isSiteSettings = (value: unknown): value is SiteSettingsSchema => siteSettingSchema.safeParse(value).success


const getSiteSettings = async (filters: DirectusRequestBody) => {
  
  const siteSettings = await getItem<SiteSettingsSchema>( 'sites', SITE_ID,  {
    fields: [
      'environmet_status',
      { 
        'favIcon': logoQuery
      }, {
        'logo': logoQuery
      }, 
      'head_code',
      'start_of_body_code',
      'end_of_body_code',
      {
        'maintenance_message': textContentQuery
      },
      {
        'coming_soon_message': textContentQuery
      },
      {
        'error_messages': [
          { 'Text_Content_id': textContentQuery },
          'error_code'
        ]
      }
    ],
    deep: {
      'maintenance_message': getTranslationFilter(filters.locale),
      'coming_soon_message': getTranslationFilter(filters.locale),
      'error_messages': {
        'Text_Content_id': getTranslationFilter(filters.locale)
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