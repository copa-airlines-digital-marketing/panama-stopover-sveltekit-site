import { PUBLIC_SUPPORTED_LANGUAGES } from "$env/static/public"
import type { RequestEvent } from "@sveltejs/kit"
import { __, filter, head, includes, isEmpty, isNil, isNotNil, pipe, replace, split } from "ramda"

type FixedString<N extends number> = { 0: string, lenght: N } & string

type Locale =  FixedString<2> | `${FixedString<2>}-${FixedString<2>}`

const LOCALE_COOKIE_KEY = 'locale' 

const removeQFactorWeighting = replace(/;q=[0-9.]+/g, '')

const splitByComma = split(',')

const getAllLanguages = pipe(removeQFactorWeighting, splitByComma)

const getSiteLocales = () => split(',', PUBLIC_SUPPORTED_LANGUAGES)

const getPreferredLocale = ({cookies, request:{ headers }}: RequestEvent) => {
  const siteLocales = getSiteLocales()
  
  const siteDefaultLocale = siteLocales[0]

  const localeFromCookie = cookies.get(LOCALE_COOKIE_KEY)

  if(isNotNil(localeFromCookie) && includes(localeFromCookie, siteLocales))
    return localeFromCookie

  const browserPreferredLocales = getAllLanguages(headers.get('Accept-Language') || '')

  if(isNil(browserPreferredLocales) || isEmpty(browserPreferredLocales))
    return siteDefaultLocale

  let preferredLocale: string | undefined

  let i = 0

  do {
    const getSitePreferedLocale = pipe(filter(includes(__, browserPreferredLocales[i])), head)
    const sitePreferredLocale = getSitePreferedLocale(siteLocales)
    if(isNotNil(sitePreferredLocale) && typeof sitePreferredLocale === 'string')
      preferredLocale = sitePreferredLocale

    i+=1
  } while (!preferredLocale && i < browserPreferredLocales.length)

  if(!preferredLocale)
    preferredLocale = siteDefaultLocale
  
  return preferredLocale

}

const isSupportedLocale = (locale: string) => includes(locale, getSiteLocales())

export {
  getPreferredLocale,
  isSupportedLocale
}

export type {
  Locale
}