/** @type {import('./$types').LayoutServerLoad} */

import { redirect } from '@sveltejs/kit'
import { MAX_COOKIE_SERIALIZATION } from '../lib/cookies/index.js'

const LOCALE_COOKIE_KEY = 'locale' 

export async function load({ cookies, params, request: { headers }, fetch }) {
  console.log('layout server')

  const localeCookie = cookies.get(LOCALE_COOKIE_KEY)

  const { locale: localeParam } = params

  const siteSettings = await fetch('/api/site-settings')
  
  if ( !localeParam  ) {

    const acceptLanguageHeader = headers.get('Accept-Language')

    //const preferredLocale = 

    return redirect(307, './en-US')
  }

  if( localeParam !== localeCookie )
    cookies.set(LOCALE_COOKIE_KEY, localeParam, MAX_COOKIE_SERIALIZATION)

	return {
		hello: 'world'
	};
}