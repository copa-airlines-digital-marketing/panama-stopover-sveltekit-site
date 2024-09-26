/** @type {import('./$types').LayoutServerLoad} */

import { error } from '@sveltejs/kit'
import { isSiteSettings } from '$lib/directus/site-settings.js'
import { head, includes, pipe, split } from 'ramda'
import { isPageSettings } from '$lib/directus/page.js'
import { say } from '$lib/utils.js'
import { isSectionSchema } from '$lib/directus/section.js'
import { PREVIEW_SECRET } from '$env/static/private'

const ifLocalHostDev = (value: string) => includes(value, ['localhost', '127.0.0.1', '192']) ? 'dev' : value

const ifProdHostProd = (value: string) => includes(value, ['www', 'stopoverinpanama', 'panama-stopover']) ? 'prod' : value

const getEnvironment = pipe(
  split('.'), 
  head, 
  ifLocalHostDev, 
  ifProdHostProd
)

export async function load({ fetch, locals: { locale }, url: { hostname, searchParams } }) {

  const preview = searchParams.get('preview')

  const previewEnv = preview === PREVIEW_SECRET ? 'preview' : null

  const layoutDataRequest = await Promise.all([
    fetch(`/api/site-settings?locale=${locale}${preview ? '&preview='+preview : ''}`),
    fetch(`/api/page?locale=${locale}${preview ? '&preview='+preview : ''}`)
  ])
  const [siteSettingsRequest, layoutRequest] = layoutDataRequest
  
  const siteSettings = await siteSettingsRequest.json()
  const layoutPage = await layoutRequest.json()
  
  const { page: layout, sections: layoutSections } = layoutPage

  if (!isSiteSettings(siteSettings) || !isPageSettings(layout) || !isSectionSchema(layoutSections)) {
    say('error ocurred while getting layout info', )
    return error(500)
  }
  
	return {
    environment: previewEnv || getEnvironment(hostname),
    locale,
		siteSettings,
    layout,
    layoutSections,
	};
}
