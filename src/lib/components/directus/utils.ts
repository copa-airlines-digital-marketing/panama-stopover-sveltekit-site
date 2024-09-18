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
  const components = await import('./')
  if (collection === 'Text_Content')
    return components.TextContent

  if (collection === 'navigation')
    return components.Navigation

  if (collection === 'logos')
    return components.Logo

  if (collection === 'header')
    return components.Header

  return null
}

export {
  landmarkToTag,
  collectionToComponent
}