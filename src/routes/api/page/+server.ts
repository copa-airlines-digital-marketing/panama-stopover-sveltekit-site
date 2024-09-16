import { getData } from "$lib/data/index.js"
import { articleToKeyMap, keyToSchemaMap, keyToValidationMap } from "$lib/directus/index.js"
import { say } from "$lib/utils.js"
import { error, json } from "@sveltejs/kit"
import { isEmpty, isNil } from "ramda"

/** @type {import('./$types').PageServerLoad} */
export async function GET({ url: { searchParams } }) {
  const locale = searchParams.get('locale')
  const home = searchParams.get('home')
  const category = searchParams.get('category')
  const subCategory = searchParams.get('subcategory')
  const article = searchParams.get('article')
  const preview = searchParams.get('preview')

  if (!locale) 
    return error(400)

  const key = articleToKeyMap(subCategory, article)

  if(isNil(key))
    return error(500)

  const data = await getData(key, 60*60*2, {locale, home, category, subCategory, article, preview}) //2h mins for pages 

  if ( isNil(data) || isEmpty(data)) {
    console.log('Error while getting page no data', data)
    return error(404)
  }

  const isValidDataFn = keyToValidationMap[key]
  
  if (!isValidDataFn(data)) {
    say('Data is not valid schema of: '+key, keyToSchemaMap[key].safeParse(data).error)
    return error(404)
  }
  
  return json( {[key]: data}, { status: 200 } )
}