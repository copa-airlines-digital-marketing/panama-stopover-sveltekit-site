import { head, pipe, replace, split } from "ramda"

type FixedString<N extends number> = { 0: string, lenght: N } & string

type Locale =  FixedString<2> | `${FixedString<2>}-${FixedString<2>}`

const removeQFactorWeighting = replace(/;q=[0-9.]+/, '')

const splitByComma = split(',')

const getFirstLanguage = pipe(removeQFactorWeighting, splitByComma, head)

const getPreferredLanguage = (acceptLanguageHeader: string) => {

  const firstLanguage = getFirstLanguage(acceptLanguageHeader)

  if (typeof firstLanguage === 'string')
    return firstLanguage
  
  return '*'
} 

export {
  getPreferredLanguage
}

export type {
  Locale
}