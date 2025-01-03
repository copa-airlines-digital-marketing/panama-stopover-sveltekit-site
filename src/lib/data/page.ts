import { getData } from "$lib/data/index.js"
import { articleToKeyMap } from "$lib/directus/index.js"
import { isPageSettings } from "$lib/directus/page.js"
import { isSectionSchema, type SectionSchema } from "$lib/directus/section.js"
import { isEmpty, isNil } from "ramda"

type RequestBody = { 
  locale: string, 
  home?: string,
  category?: string, 
  subCategory?: string, 
  article?: string, 
  preview?: string | null | undefined
}

export async function getPageData(body: RequestBody) {  

  const { locale, subCategory, article, preview } = body

  const storefront = 'gs'

  if (!locale) 
    return null

  const key = articleToKeyMap(subCategory || null, article || null)

  if(isNil(key))
    return null

  const data = await getData(key, 60*60*2, body) //2h mins for pages 

  if (isNil(data) || isEmpty(data)) {
    return null
  }

  let sections: SectionSchema[] | undefined = undefined

  if(isPageSettings(data)) {
    const sectionsRequest = await getData('sections', 60*60*2, { locale, storefront, page: data.id, preview })
    
    if(!isSectionSchema(sectionsRequest)) {
      return null
    }
    
    sections = sectionsRequest
  }
  
  return {[key]: data, sections}
}