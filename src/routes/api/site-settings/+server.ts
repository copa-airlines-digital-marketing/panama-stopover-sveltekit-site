import { getData } from "$lib/data/index.js"
import { siteSettingSchema } from "$lib/directus/site-settings"
import { error, json } from "@sveltejs/kit"
import { isEmpty, isNil } from "ramda"

/** @type {import('./$types').PageServerLoad} */
export async function GET() {
  const data = await getData('site-settings', 60*5) //5 minutes of site settings

  if ( isNil(data) || isEmpty(data)) {
    console.log('Error while getting site settings no data', data)
    return error(404)
  }

  try {
    siteSettingSchema.parse(data)
    return json( data, { status: 200 } )
  } catch (exception) {
    console.log('Error while parsing data', exception)
    return error(500)
  }
}