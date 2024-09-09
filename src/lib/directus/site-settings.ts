import { z } from 'zod'
import { logosSchema } from './logos'
import { getItem } from './utils'
import { SITE_ID } from '$env/static/private'

const siteLang = z.object({
  lang_code: z.string(),
  sort: z.number()
})

const environmentStatusSchema = z.object({
  environment: z.string(),
  state: z.string()
})

const siteSettingSchema = z.object({
  environment_status: environmentStatusSchema,
  favIcon: logosSchema,
  logo: logosSchema,
  supported_languages: siteLang,
  head_code: z.string(),
  start_of_body_code: z.string(),
  end_of_body_code: z.string()
})

type SiteSettingsSchema = z.infer<typeof siteSettingSchema>

const getSiteSettings = () => getItem<SiteSettingsSchema>( 'sites', SITE_ID,  {fields:['environment_status', 'favIcon', 'logo', 'supported_languages', 'head_code', 'start_of_body_code', 'end_of_body_code']})

export {
  getSiteSettings,
  siteSettingSchema
  
}

export type {
  SiteSettingsSchema
}