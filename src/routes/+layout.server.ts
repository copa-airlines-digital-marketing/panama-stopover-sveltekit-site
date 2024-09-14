/** @type {import('./$types').LayoutServerLoad} */

import { error } from '@sveltejs/kit'
import { isSiteSettings } from '$lib/directus/site-settings.js'
import { head, includes, isEmpty, pipe, split } from 'ramda'
import { isPageSettings } from '$lib/directus/page.js'

const ifLocalHostDev = (value: string) => includes(value, ['localhost', '127.0.0.1']) ? 'dev' : value

const ifProdHostProd = (value: string) => includes(value, ['www', 'stopoverinpanama', 'panama-stopover']) ? 'prod' : value

const getEnvironment = pipe(
  split('.'), 
  head, 
  ifLocalHostDev, 
  ifProdHostProd
)

export async function load({ fetch, locals: { locale }, url: { hostname } }) {
  console.log('+layout.server.svelte')
  const layoutDataRequest = await Promise.all([
    fetch('/api/site-settings?locale='+locale),
    fetch(`/api/page?locale=${locale}`)
  ])
  const [siteSettingsRequest, layoutRequest] = layoutDataRequest

  const siteSettings = await siteSettingsRequest.json()
  const layout = await layoutRequest.json()
  
  if (!siteSettings || isEmpty(siteSettings) || !isSiteSettings(siteSettings) || !layout || isEmpty(layout) || !isPageSettings(layout)) {
    console.log(`error while loading site settings and layout`, siteSettings, layout)
    return error(500) 
  }
  
	return {
    environment: getEnvironment(hostname),
    locale,
		siteSettings,
    layout
	};
}
