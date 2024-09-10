import { z } from 'zod'
import { logosSchema } from './logos'
import { getItem } from './utils'
import { SITE_ID } from '$env/static/private'

const siteLang = z.object({
  lang_code: z.string(),
  sort: z.number()
}).array()

const environmentStatusSchema = z.object({
  environment: z.string(),
  state: z.string()
}).array()

const siteSettingSchema = z.object({
  id: z.optional(z.number()),
  environmet_status: environmentStatusSchema,
  favIcon: logosSchema,
  logo: logosSchema,
  supported_languages: siteLang,
  head_code: z.string().nullable(),
  start_of_body_code: z.string().nullable(),
  end_of_body_code: z.string().nullable()
})

type SiteSettingsSchema = z.infer<typeof siteSettingSchema>

const isSiteSettings = (value: unknown): value is SiteSettingsSchema => siteSettingSchema.safeParse(value).success

const getSiteSettings = async () => {  
  const siteSettings = await getItem<SiteSettingsSchema>( 'sites', SITE_ID,  {fields:['environmet_status', {'favIcon': ['image', 'code']}, {'logo': ['image', 'code']}, {'supported_languages': ['lang_code', 'sort']}, 'head_code', 'start_of_body_code', 'end_of_body_code']})

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