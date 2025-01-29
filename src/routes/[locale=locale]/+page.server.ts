import { getPageData } from '$lib/data/page.js';
import { isPageSettings } from '$lib/directus/page.js';
import { say } from '$lib/utils.js';
import { error } from '@sveltejs/kit';
import { getAllSectionModules, getModuleRequest, setToValue } from '../utils.js';
import { isEmpty, isNil } from 'ramda';

export async function load(event) {
  const { locals: { locale }, parent, url: { searchParams } }  = event

  const preview = searchParams.get('preview')

  if(!locale) {
    say('No locale in locals', event)
    return error(500)
  }

  console.log('Requesting from Directus')

  const [pageData, parentData] = await Promise.all([getPageData({locale, home:'home', preview}), parent()])
  const { page, sections: pageSections } = pageData

  if(!isPageSettings(page)) {
    say('error ocurred while getting homepage info')
    return error(500)
  }

  const modulesPaths = getAllSectionModules(pageSections)

  const modulesData = await Promise.allSettled(modulesPaths.map(getModuleRequest(pageSections, locale)))

  modulesPaths.forEach((path, key) => {
    const items = modulesData[key].value || null

    if(isNil(items) || isEmpty(items))
      return

    setToValue(pageSections, items, [...path, 'items'])
  })

  return {
    ...parentData,
    page,
    pageSections
  }
}