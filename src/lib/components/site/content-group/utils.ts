import { Tab } from '$lib/components/site/content-group/tabs'
import { ContentGroup } from './default'

const componentToConentGroup = (name: string | null) => { 
  if ( name === 'tab')
    return Tab

  return ContentGroup
}

export { componentToConentGroup }