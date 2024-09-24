import { getData } from "$lib/data/index.js"
import { articleToKeyMap } from "$lib/directus/index.js"
import { isPageSettings } from "$lib/directus/page.js"
import { isSectionSchema, type SectionSchema } from "$lib/directus/section.js"
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

  const storefront = 'gs'

  if (!locale) 
    return error(400)

  const key = articleToKeyMap(subCategory, article)

  if(isNil(key))
    return error(404)

  const data = await getData(key, 60*60*2, {locale, home, category, subCategory, article, preview}) //2h mins for pages 

  if (isNil(data) || isEmpty(data)) {
    return error(404)
  }

  let sections: SectionSchema[] | undefined = undefined

  if(isPageSettings(data)) {
    const sectionsRequest = await getData('sections', 60*60*2, { locale, storefront, page: data.id, preview })

    if(!isSectionSchema(sectionsRequest)) {
      return error(404)
    }

    sections = sectionsRequest
  }
  
  return json( {[key]: data, sections}, { status: 200 } )
}