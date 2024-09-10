/** @type {import('./$types').LayoutServerLoad} */

import { error, redirect } from '@sveltejs/kit'
import { MAX_COOKIE_SERIALIZATION } from '../lib/cookies/index.js'
import { isSiteSettings } from '$lib/directus/site-settings.js'
import { getAllLanguages } from '$lib/i18n/index.js'
import { __, filter, head, includes, isEmpty, isNil, isNotEmpty, isNotNil, pipe } from 'ramda'

const LOCALE_COOKIE_KEY = 'locale' 

export async function load({ cookies, params, request: { headers }, fetch }) {
  const localeCookie = cookies.get(LOCALE_COOKIE_KEY)

  const { locale: localeParam } = params

  const siteSettingsRequest = await fetch('/api/site-settings')

  const siteSettings = await siteSettingsRequest.json()

  if (!siteSettings || isEmpty(siteSettings) || !isSiteSettings(siteSettings)) {
    console.log(`error while loading site settings`, siteSettings)
    return error(500) 
  }

  const siteLangs = siteSettings.supported_languages.map(value => value.lang_code)

  if (!localeParam) {

    const acceptLanguageHeader = headers.get('Accept-Language')

    const preferredLocales = getAllLanguages(acceptLanguageHeader || '')

    return redirect(307, './' + getLanguageFromCookiesOrPreference(siteLangs, localeCookie, preferredLocales))
  }

  if (includes(localeParam, siteLangs))
    return error(404)

  if( localeParam !== localeCookie )
    cookies.set(LOCALE_COOKIE_KEY, localeParam, MAX_COOKIE_SERIALIZATION)

	return {
		siteSettings: siteSettings
	};
}

const getLanguageFromCookiesOrPreference = (siteLangs: string[], cookieLang: string | undefined, preferences: string[] | undefined) => {

  const defaultSiteLang = siteLangs[0]

  if(isNotNil(cookieLang) && includes(cookieLang, siteLangs))
    return cookieLang

  if(isNil(preferences))
    return defaultSiteLang

  let preferredLocale = null

  let i = 0

  do {
    const getSitePreferedLang = pipe(filter(includes(__, preferences[i])), head)
    const sitePreferedLang = getSitePreferedLang(siteLangs)
    if(isNotNil(sitePreferedLang) && isNotEmpty(sitePreferedLang))
      preferredLocale = sitePreferedLang

    i+=1
  } while (!preferredLocale && i < preferences.length)

  if(!preferredLocale)
    preferredLocale = defaultSiteLang
  
  return preferredLocale

}