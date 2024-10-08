import { isHeaderSchema, type HeaderSchema } from "$lib/directus/header";
import { isLogoSchema, type LogoSchema } from "$lib/directus/logos";
import { isNavigationSchema, type NavigationSchema } from "$lib/directus/navigation";
import type { SectionContentSchema, SectionSchema } from "$lib/directus/section";
import { isTextContentSchema, type TextContentSchema } from "$lib/directus/text-content";
import { Header } from "./blocks/header";
import { ContentGroup } from "./general-components/content-group";
import Logo from "./general-components/logo.svelte";
import Navigation from "./general-components/navigation.svelte";
import TextContent from "./general-components/text-content.svelte";
import { FooterPrimary } from "./section/footer-primary";
import { NoComponentSection } from "./section/no-component";
import { SectionAsTab } from "./section/tabs";

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

const collectionToComponent = (collection: SectionContentSchema['collection']) => {
  if (collection === 'Text_Content')
    return TextContent

  if (collection === 'navigation')
    return Navigation

  if (collection === 'logos')
    return Logo

  if (collection === 'header')
    return Header

  if (collection === 'content_group')
    return ContentGroup

  return null
}

const sectionToComponentMap = (component: SectionSchema['component']) => {

  if(component === 'footer-primary')
    return FooterPrimary

  if(component === 'tabs')
    return SectionAsTab

  return NoComponentSection

}

export {
  landmarkToTag,
  collectionToComponent,
  sectionToComponentMap,
  DirectusCollectionToValidationMap
}