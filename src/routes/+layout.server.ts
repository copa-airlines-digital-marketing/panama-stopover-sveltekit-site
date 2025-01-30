/** @type {import('./$types').LayoutServerLoad} */

import { error, redirect } from '@sveltejs/kit'
import { isSiteSettings } from '$lib/directus/site-settings.js'
import { head, includes, pipe, split } from 'ramda'
import { isPageSettings } from '$lib/directus/page.js'
import { say } from '$lib/utils.js'
import { isSectionSchema } from '$lib/directus/section.js'
import { PREVIEW_SECRET } from '$env/static/private'
import { getPageData } from '$lib/data/page.js'
import { getSiteSettings } from '$lib/data/site-settings.js'
import { getPreferredLocale } from '$lib/i18n/index.js'

const ifLocalHostDev = (value: string) => includes(value, ['localhost', '127.0.0.1', '192', 'sveltekit-prerender']) ? 'dev' : value

const ifProdHostProd = (value: string) => includes(value, ['www', 'stopoverinpanama', 'panama-stopover', 'panama-stopover-29a13ab619c8']) ? 'prod' : value

const getEnvironment = pipe(
  split('.'), 
  head, 
  ifLocalHostDev, 
  ifProdHostProd
)

export async function load(event) {

  const { params, url: { hostname }, request: { headers }, locals } = event

  const locale = params.locale || locals.locale || getPreferredLocale(event) || 'es'

  if(!params.locale)
    return redirect(307, '/'+locale)

  const preview = null

  const isMobile = /mobile|android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(headers.get('user-agent') || '')
  const previewEnv = preview === PREVIEW_SECRET ? 'preview' : null

  console.log('locale', locale)

  const layoutDataRequest = await Promise.all([
    getSiteSettings(locale, preview),
    getPageData({locale, preview})
  ])

  const [siteSettings, layoutPage] = layoutDataRequest
    
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
    isMobile
	};
}