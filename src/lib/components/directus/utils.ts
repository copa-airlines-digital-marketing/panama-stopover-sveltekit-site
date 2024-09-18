import { isHeaderSchema, type HeaderSchema } from "$lib/directus/header";
import { isLogoSchema, type LogoSchema } from "$lib/directus/logos";
import { isNavigationSchema, type NavigationSchema } from "$lib/directus/navigation";
import type { SectionContentSchema, SectionSchema } from "$lib/directus/section";
import { isTextContentSchema, type TextContentSchema } from "$lib/directus/text-content";

type DirectusCollectionItems = SectionContentSchema['collection']

type DirectusCollectionToSchemaMap = {
  'header': HeaderSchema,
  'logos': LogoSchema,
  'navigation': NavigationSchema
  'Text_Content': TextContentSchema
}

const DirectusCollectionToValidationMap: Record<DirectusCollectionItems, (v: unknown) => v is DirectusCollectionToSchemaMap[DirectusCollectionItems]> = {
  'header': isHeaderSchema,
  'logos': isLogoSchema,
  'navigation': isNavigationSchema,
  'Text_Content': isTextContentSchema
}


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
  collectionToComponent,
  DirectusCollectionToValidationMap
}