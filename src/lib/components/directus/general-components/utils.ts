const componentNameToComponentMap = async (name: string | null) => {
  if(!name) 
    return null

  if(name === 'navigation-home')
    return (await import('$lib/components/site/navigation-home')).NavigationHome

  if(name === 'main-navigation')
    return (await import('$lib/components/site/main-navigation')).MainNavigation

  return null
}

export {
  componentNameToComponentMap
}