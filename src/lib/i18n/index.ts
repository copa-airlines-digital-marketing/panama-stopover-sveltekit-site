import { __, filter, head, includes, isNil, isNotEmpty, isNotNil, pipe, replace, split } from "ramda"

type FixedString<N extends number> = { 0: string, lenght: N } & string

type Locale =  FixedString<2> | `${FixedString<2>}-${FixedString<2>}`

const removeQFactorWeighting = replace(/;q=[0-9.]+/g, '')

const splitByComma = split(',')

const getAllLanguages = pipe(removeQFactorWeighting, splitByComma)

const calculatePageLanguage = (siteLanguages: string[], languageFromCookies: string | undefined, languagePreferences: string[] | undefined) => {
  const defaultSiteLang = siteLanguages[0]

  if(isNotNil(languageFromCookies) && includes(languageFromCookies, siteLanguages))
    return languageFromCookies

  if(isNil(languagePreferences))
    return defaultSiteLang

  let preferredLocale = null

  let i = 0

  do {
    const getSitePreferedLang = pipe(filter(includes(__, languagePreferences[i])), head)
    const sitePreferedLang = getSitePreferedLang(siteLanguages)
    if(isNotNil(sitePreferedLang) && isNotEmpty(sitePreferedLang))
      preferredLocale = sitePreferedLang

    i+=1
  } while (!preferredLocale && i < languagePreferences.length)

  if(!preferredLocale)
    preferredLocale = defaultSiteLang
  
  return preferredLocale
}

export {
  getAllLanguages,
  calculatePageLanguage
}

export type {
  Locale
}