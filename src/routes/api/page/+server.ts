import { CATEGORIES_MAP } from "$env/static/private"
import { getData } from "$lib/data/index.js"
import type { DirectusDataKeys } from "$lib/directus/index.js"
import { pageSchema } from "$lib/directus/page.js"
import { say } from "$lib/utils.js"
import { error, json } from "@sveltejs/kit"
import { filter, head, includes, isEmpty, isNil, keys, pipe } from "ramda"

const keymapFilter = (subCategory: string) => (value: string) => {
  return includes(subCategory, value)
}

const getKeyOfArticle = (subCategory: string, map: Record<DirectusDataKeys, string>) => pipe(filter(keymapFilter(subCategory)), keys, head)(map)

const articleToKeyMap = (subCategory: string | null): DirectusDataKeys | null => {
  if(isNil(subCategory))
    return 'page'

  try {
    const keyMap = JSON.parse(CATEGORIES_MAP)

    const key: DirectusDataKeys | undefined = getKeyOfArticle(subCategory, keyMap)

    if(!key || typeof key !== 'string')
      return 'page'

    return key
  } catch (err) {
    say('An error ocurred while identifying the table to query', err)
    return null
  }
}

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

  const key = articleToKeyMap(subCategory)

  if(isNil(key))
    return error(500)

  const data = await getData(key, 60*60*2, {locale, home, category, subCategory, article, preview}) //2h mins for pages 

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