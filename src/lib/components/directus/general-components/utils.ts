import { LanguageSelector } from '$lib/components/site/navigation/language-selector'
import { MainNavigation } from '$lib/components/site/navigation/main'
import { NavigationHome } from '$lib/components/site/navigation/home'
import { LegalNavigation } from '$lib/components/site/navigation/legal'
import { SocialNavigation } from '$lib/components/site/navigation/social'
import { Copyright } from '$lib/components/site/text-content/copyright'
import { Hero as HeroA } from '$lib/components/site/text-content/hero-a'
import { HeroB } from '$lib/components/site/text-content/hero-b'
import { isKeyOfObject } from '$lib/utils'
import { BaseTextContent } from '$lib/components/site/text-content/base'

const componentNameToComponentMap = (name: string | null) => {
  if(!name) 
    return null

  if(name === 'navigation-home')
    return NavigationHome

  if(name === 'main-navigation')
    return MainNavigation

  if(name === 'language-selector')
    return LanguageSelector

  if(name === 'legal-navigation')
    return LegalNavigation

  if(name === 'social-navigation')
    return SocialNavigation

  return null
}

const textContentToComponentMap = ( name: string | null ) => {
  
  const map = {
    'copyrights': Copyright,
    'hero-a': HeroA,
    'hero-b': HeroB
  }

  if (!name || !isKeyOfObject(name, map))
    return BaseTextContent

  return map[name]
}

export {
  componentNameToComponentMap,
  textContentToComponentMap
}