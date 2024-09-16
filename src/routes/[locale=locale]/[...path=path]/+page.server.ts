import { isNotFoundSchema } from '$lib/directus/not-found.js';
import { isPageSettings, pageSchema } from '$lib/directus/page.js';
import { say } from '$lib/utils.js';
import { error } from '@sveltejs/kit';
import { filter, isNotNil } from 'ramda';

const valueToSeachParams = (locale: string, path: string, preview: string | null) => {
  const [category, subcategory, article] = path.split('/')
  const preliminarObject = {
    locale,
    category,
    subcategory,
    article,
    preview
  }
  return filter(isNotNil, preliminarObject)
} 

export async function load(event) {
  const { fetch, locals: { locale }, parent, params: { path } , route, url: { searchParams } }  = event

  if(!path) {
    say('Path param is required', event)
    return error(404)
  }

  if(!locale) {
    say('No locale in locals', event)
    return error(500)
  }

  const preview = searchParams.get('preview')

  const queryParams = new URLSearchParams(valueToSeachParams(locale, path, preview)) 

  const pageRequest = await fetch(`/api/page${ queryParams.size > 1 ? '?' + queryParams.toString() : '' }`)
  const parentData = await parent()
  const page = await pageRequest.json()

  if(isNotFoundSchema(page)) {
    say('Page requested not found', route)
    return error(404)
  }

  if(!isPageSettings(page)) {
    say('Requested page does not fulfill the page schema', pageSchema.safeParse(page).error)
    return error(500)
  }

  return {
    ...parentData,
    page
  }
}