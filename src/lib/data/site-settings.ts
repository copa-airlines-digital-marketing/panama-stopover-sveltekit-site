import { getData } from "$lib/data/index.js"
import { siteSettingSchema } from "$lib/directus/site-settings"
import { isEmpty, isNil } from "ramda"

export async function getSiteSettings(locale: string, preview?: string | null | undefined) {
  if (!locale) 
    return null

  const data = await getData('site-settings', 60*60*2, {locale, preview}) // 2 hours site settings

  if ( isNil(data) || isEmpty(data)) {
    console.log('Error while getting site settings no data', data)
    return null
  }
  
  try {
    siteSettingSchema.parse(data)
    return data
  } catch (exception) {
    console.log('Error while parsing site settings data', exception)
    return null
  }
}