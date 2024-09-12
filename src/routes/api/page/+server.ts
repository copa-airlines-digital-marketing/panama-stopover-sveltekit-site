import { getData } from "$lib/data/index.js"
import { siteSettingSchema } from "$lib/directus/site-settings"
import { error, json } from "@sveltejs/kit"
import { isEmpty, isNil } from "ramda"

/** @type {import('./$types').PageServerLoad} */
export async function GET({ url: { searchParams } }) {
  const locale = searchParams.get('locale')
  const category = searchParams.get('category')
  const subCategory = searchParams.get('subcategory')
  const article = searchParams.get('article')

  if (!locale) 
    return error(400)

  const data = await getData('page', 60*30, {locale, category, subCategory, article}) //5 minutes of site settings


  if ( isNil(data) || isEmpty(data)) {
    console.log('Error while getting page no data', data)
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