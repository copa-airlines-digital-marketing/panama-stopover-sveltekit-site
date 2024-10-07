import { z } from "zod";
import { textContentQuery, textContentSchema } from "./text-content";
import { navigationQuery, navigationSchema } from "./navigation";
import { logoQuery, logosSchema } from "./logos";
import { headerQuery, headerSchema } from "./header";
import { getItems, getTranslationFilter, type DirectusRequestBody } from "./utils";
import { say } from "$lib/utils";
import { groupSchemaQueryFields, groupsSchema } from "./groups";
import { contentGroupQueryFields, contentGroupSchema } from "./content-group";
import { stopoverHotelModuleSchema } from "./stopover_hotel_module";
import { formQueryFields, formSchema } from "./forms";

const horizontal_alignment = z.union([z.literal('left'), z.literal('center'), z.literal('right')])
const vertical_alignment = z.union([z.literal('top'), z.literal('center'), z.literal('bottom'), z.literal('baseline'), z.literal('stretch')])
const content_distribution = z.union([z.literal('space-around'), z.literal('space-between'), z.literal('space-evenly')])
const spacing = z.union([z.literal('none'), z.literal('minimal'), z.literal('tiny'), z.literal('petit'), z.literal('normal'), z.literal('roomy'), z.literal('spacious'), z.literal('big'), z.literal('huge')])

const directusSectionItemName = z.union([z.literal('Text_Content'), z.literal('navigation'), z.literal('logos'), z.literal('header'), z.literal('icons'), z.literal('groups'), z.literal('content_group'), z.literal('stopover_hotel_module'), z.literal('form')])


const sectionContentSchema = z.object({
  id: z.union([z.string(), z.number()]),
  item: textContentSchema.or(navigationSchema).or(logosSchema).or(headerSchema).or(groupsSchema).or(contentGroupSchema).or(stopoverHotelModuleSchema).or(formSchema),
  collection: directusSectionItemName,
  component_name: z.string().nullable(),
  area: z.string().nullable(),
  display: z.union([z.literal('100'), z.literal('75'), z.literal('50'), z.literal('25')]).nullable(),
  theme: z.union([z.literal('light'), z.literal('dark')]).nullable(),
  horizontal_alignment: horizontal_alignment.nullable(),
  vertical_alignment: vertical_alignment.nullable(),
})

const pageStorefrontSchema = z.object({
  storefronts_code: z.string(),
  pages_id: z.number()
})

const pageStorefrontSectionsSchema = z.object({
  page_storefronts_id: pageStorefrontSchema,
  sort: z.number()
})

const sectionSchema = z.object({
  id: z.union([z.string(), z.number()]),
  component: z.union([z.literal('header-primary'), z.literal('hero-primary'), z.literal('footer-primary')]).nullable(),
  landmark: z.union([z.literal('aside'), z.literal('footer'), z.literal('header'), z.literal('hero'), z.literal('loading'), z.literal('modal'), z.literal('regular'), z.literal('section')]),
  section_id: z.string().nullable(),
  horizontal_behaviour: z.union([z.literal('full'), z.literal('contained'), z.literal('container-grid')]),
  content_spacing: spacing,
  content_horizontal_alignment: horizontal_alignment.nullish(),
  content_horizontal_distribution: z.union([horizontal_alignment, content_distribution]).nullish(),
  content_vertical_alignment: vertical_alignment.nullish(),
  content_vertical_distribution: z.union([vertical_alignment, content_distribution]).nullish(),
  background_color: z.string().nullish(),
  vertical_spacing: spacing,
  section_content: sectionContentSchema.array().nullish(),
  page_storefronts: pageStorefrontSectionsSchema.array().nullish()
})

type SectionSchema = z.infer<typeof sectionSchema>

type SectionContentSchema = z.infer<typeof sectionContentSchema>

const isSectionSchema = (value: unknown): value is SectionSchema[] => sectionSchema.array().safeParse(value).success

const sectionQuery = (storefront: string, page: string, locale: string) => ({
  fields: [
    'id',
    'landmark',
    'section_id',
    'horizontal_behaviour',
    'component',
    'content_spacing',
    'vertical_spacing',
    'content_horizontal_alignment',
    'content_horizontal_distribution',
    'content_vertical_alignment',
    'content_vertical_distribution',
    'background_color',
    { 'section_content': [
      'id',
      'collection',
      'component_name',
      'area',
      'display',
      'theme',
      'horizontal_alignment',
      'vertical_alignment',
      { 
        'item': {
          'navigation': navigationQuery,
          'Text_Content': textContentQuery,
          'logos': logoQuery,
          'icons': logoQuery,
          'header': headerQuery,
          'content_group': contentGroupQueryFields,
        } 
      }
    ]}
  ],
  filter: {
    _and: [
      { page_storefronts: { pages_storefronts_id: { storefronts_code: { _eq: storefront }}}},
      { page_storefronts: { pages_storefronts_id: { pages_id: { _eq: page }}}}
    ]
  },
  deep: {
    section_content: {
      "item:Text_Content": getTranslationFilter(locale),
      "item:navigation": getTranslationFilter(locale),
      "item:header": {
        navigations: {
          navigation_id: getTranslationFilter(locale)
        }
      }
    }
  },
  sort: ['page_storefronts.sort']
})

const getSections = async (filters: DirectusRequestBody) => {

  const { locale, storefront, page } = filters

  if(!locale || !storefront || !page){
    say('Locale, storefront, and page are required to get the sections', filters)
    return null
  }

  const sectionRequest = await getItems('sections', sectionQuery(storefront, page, locale), filters.preview)

  console.log(sectionRequest)

  
  if(isSectionSchema(sectionRequest)) {
    return sectionRequest
  }
  
  say('Sections did not comply with the schema', {sectionRequest, filters, errors: sectionSchema.array().safeParse(sectionRequest).error})
  return null
}

export {
  sectionSchema,
  getSections,
  isSectionSchema
}

export type {
  SectionSchema,
  SectionContentSchema
}