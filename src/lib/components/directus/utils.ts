import type { SectionContentSchema, SectionSchema } from "$lib/directus/section";

const landmarkToTag = (landmark: SectionSchema['landmark']): keyof HTMLElementTagNameMap => {
  if (landmark === 'aside')
    return 'aside'

  if (landmark === 'footer')
    return 'footer'

  if (landmark === 'header')
    return 'header'

  if (landmark === 'section')
    return 'section'

  // hero, modal, regular, loading are all divs

  return 'div'
}

const collectionToComponent = async (collection: SectionContentSchema['collection']) => {
  if (collection === 'Text_Content')
    return (await import('./')).TextContent

  if (collection === 'navigation')
    return (await import('./')).Navigation

  if (collection === 'logos')
    return (await import('./')).Logo

  return null
}

export {
  landmarkToTag,
  collectionToComponent
}