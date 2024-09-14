import { getData } from "$lib/data/index.js"
import { pageSchema } from "$lib/directus/page.js"
import { error, json } from "@sveltejs/kit"
import { isEmpty, isNil } from "ramda"

/** @type {import('./$types').PageServerLoad} */
export async function GET({ url: { searchParams } }) {
  const locale = searchParams.get('locale')
  const home = searchParams.get('home')
  const category = searchParams.get('category')
  const subCategory = searchParams.get('subcategory')
  const preview = searchParams.get('preview')

  if (!locale) 
    return error(400)

  const data = await getData('page', 60*60*2, {locale, home, category, subCategory, preview}) //2h mins for pages 

  if ( isNil(data) || isEmpty(data)) {
    console.log('Error while getting page no data', data)
    return error(404)
  }
  
  try {
    pageSchema.parse(data)
    return json( data, { status: 200 } )
  } catch (exception) {
    console.log('Error while parsing page data', exception)
    return error(500)
  }
}