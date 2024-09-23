import { LanguageSelector } from '$lib/components/site/navigation/language-selector'
import { MainNavigation } from '$lib/components/site/navigation/main'
import { NavigationHome } from '$lib/components/site/navigation/home'
import { LegalNavigation } from '$lib/components/site/navigation/legal'
import { SocialNavigation } from '$lib/components/site/navigation/social'
import { Copyright } from '$lib/components/site/text-content/copyright'
import { isKeyOfObject } from '$lib/utils'

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
    'copyrights': Copyright
  }

  if (!name || !isKeyOfObject(name, map))
    return null

  return map[name]
}

export {
  componentNameToComponentMap,
  textContentToComponentMap
}