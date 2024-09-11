import { z } from 'zod'
import { logosSchema } from './logos'
import { getItem, type DirectusRequestBody } from './utils'
import { SITE_ID } from '$env/static/private'
import { textContentSchema } from './text-content'

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

const textContentFields = [{
  'translations': [
    'title',
    'description',
    'call_to_actions',
  ]
}]

const getSiteSettings = async (filters: DirectusRequestBody) => {
  const textTranslationFilter = {
    'translations': {
      _filter:{
        'languages_code':{
          '_eq': filters.locale
        }
      }
    }
  }
  console.log(textTranslationFilter)
  const siteSettings = await getItem<SiteSettingsSchema>( 'sites', SITE_ID,  {
    fields: [
      'environmet_status',
      { 
        'favIcon': ['image', 'code']
      }, {
        'logo': ['image', 'code']
      }, 
      'head_code',
      'start_of_body_code',
      'end_of_body_code',
      {
        'maintenance_message': textContentFields
      },
      {
        'coming_soon_message': textContentFields
      },
      {
        'error_messages': [
          { 'Text_Content_id': textContentFields },
          'error_code'
        ]
      }
    ],
    deep: {
      'maintenance_message': textTranslationFilter,
      'coming_soon_message': textTranslationFilter,
      'error_messages': {
        'Text_Content_id': textTranslationFilter
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