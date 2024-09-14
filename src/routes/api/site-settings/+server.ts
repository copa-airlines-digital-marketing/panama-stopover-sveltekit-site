import { getData } from "$lib/data/index.js"
import { siteSettingSchema } from "$lib/directus/site-settings"
import { error, json } from "@sveltejs/kit"
import { isEmpty, isNil } from "ramda"

/** @type {import('./$types').PageServerLoad} */
export async function GET({ url: { searchParams } }) {
  const locale = searchParams.get('locale') 
  const preview = searchParams.get('preview')

  if (!locale) 
    return error(400)

  const data = await getData('site-settings', 60*60*2, {locale, preview}) // 2 hours site settings

  if ( isNil(data) || isEmpty(data)) {
    console.log('Error while getting site settings no data', data)
    return error(404)
  }
  
  try {
    siteSettingSchema.parse(data)
    return json( data, { status: 200 } )
  } catch (exception) {
    console.log('Error while parsing site settings data', exception)
    return error(500)
  }
}