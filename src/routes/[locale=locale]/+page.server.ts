import { isPageSettings, pageSchema } from '$lib/directus/page.js';
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
  const page = pageData.page

  if(!isPageSettings(page)) {
    say('Requested page does not fulfill the page schema', pageSchema.safeParse(page).error)
    return error(500)
  }

  return {
    ...parentData,
    page
  }
}