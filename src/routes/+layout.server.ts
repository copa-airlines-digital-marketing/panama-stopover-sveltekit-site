/** @type {import('./$types').LayoutServerLoad} */

import { error, redirect } from '@sveltejs/kit'
import { isSiteSettings } from '$lib/directus/site-settings.js'
import { isPageSettings } from '$lib/directus/page.js'
import { say } from '$lib/utils.js'
import { isSectionSchema } from '$lib/directus/section.js'
import { getPageData } from '$lib/data/page.js'
import { getSiteSettings } from '$lib/data/site-settings.js'
import { getPreferredLocale } from '$lib/i18n/index.js'

export async function load(event) {

  const { url: { pathname }, request: { headers } } = event
  
  const pahtLocale = pathname.split('/')[1]
  
  const locale = pahtLocale || getPreferredLocale(event) || 'es'

  if(!pahtLocale)
    return redirect(307, '/'+locale)

  const preview = null

  const isMobile = /mobile|android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(headers.get('user-agent') || '')

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
    environment: 'prod',
    locale,
		siteSettings,
    layout,
    layoutSections,
    isMobile
	};
}
