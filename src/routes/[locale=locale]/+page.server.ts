import { getPageData } from '$lib/data/page.js';
import { isPageSettings } from '$lib/directus/page.js';
import { say } from '$lib/utils.js';
import { error } from '@sveltejs/kit';

export async function load(event) {
  const { locals: { locale }, parent, url: { searchParams } }  = event

  const preview = searchParams.get('preview')

  if(!locale) {
    say('No locale in locals', event)
    return error(500)
  }

  const [pageData, parentData] = await Promise.all([getPageData({locale, home:'home', preview}), parent()])
  const { page, sections: pageSections } = pageData

  if(!isPageSettings(page)) {
    say('error ocurred while getting homepage info')
    return error(500)
  }

  return {
    ...parentData,
    page,
    pageSections
  }
}