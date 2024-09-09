import { z } from 'zod'
import { logosSchema } from './logos'

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

const getSiteSettings = () => {
  
}

export {
  siteSettingSchema
}

export type {
  SiteSettingsSchema
}