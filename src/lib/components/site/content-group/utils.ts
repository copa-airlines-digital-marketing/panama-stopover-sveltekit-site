import { Tab } from '$lib/components/site/content-group/tabs'
import { ContentGroup } from './default'
import { PillardGrid } from './pilar-grid'

const componentToConentGroup = (name: string | null) => { 
  if ( name === 'tabs')
    return Tab

  if ( name === 'pillar-grid')
    return PillardGrid

  return ContentGroup
}

export { componentToConentGroup }