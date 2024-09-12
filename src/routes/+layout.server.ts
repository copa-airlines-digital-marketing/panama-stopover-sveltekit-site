/** @type {import('./$types').LayoutServerLoad} */

import { error } from '@sveltejs/kit'
import { isSiteSettings } from '$lib/directus/site-settings.js'
import { isEmpty } from 'ramda'

export async function load({ fetch, locals: { locale } }) {
  console.log('+layout.server.svelte')
  const siteSettingsRequest = await fetch('/api/site-settings?locale='+locale)
  const siteSettings = await siteSettingsRequest.json()
  
  if (!siteSettings || isEmpty(siteSettings) || !isSiteSettings(siteSettings)) {
    console.log(`error while loading site settings`, siteSettings)
    return error(500) 
  }
  
	return {
    locale,
		siteSettings
	};
}
