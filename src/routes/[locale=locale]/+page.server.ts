import { isPageSettings } from '$lib/directus/page.js';
import { say } from '$lib/utils.js';
import { error } from '@sveltejs/kit';

export async function load(event) {
  const { fetch, locals: { locale }, parent, url: { searchParams } }  = event

  const preview = searchParams.get('preview')

  if(!locale) {
    say('No locale in locals', event)
    return error(500)
  }

  const pageRequest = await fetch(`/api/page?locale=${locale}&home=home${preview ? '&preview='+preview : ''}`)
  const parentData = await parent()
  const pageData = await pageRequest.json()
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