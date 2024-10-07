import { z } from "zod";
import { navigationQuery, navigationSchema } from "./navigation";
import { textContentQuery, textContentSchema } from "./text-content";
import { stopoverHotelModuleQueryFields, stopoverHotelModuleSchema } from "./stopover_hotel_module";
import { formQueryFields, formSchema } from "./forms";

const contentGroupTranslation = z.object({
  languages_code: z.string().optional(),
  title: z.string(),
})

const contentGroupCollectionName = z.union([
  z.literal('navigation'),
  z.literal('Text_Content'),
  z.literal('form'),
  z.literal('content_group'),
  z.literal('stopover_hotel_module')
])

const contentGroupItems = z.union([navigationSchema, textContentSchema, stopoverHotelModuleSchema, formSchema])

const contentGroupContentSchema = z.object({
  item: contentGroupItems,
  collection: contentGroupCollectionName
})

const contentGroupSchema = z.object({
  translations: contentGroupTranslation.array().nullable(),
  content: contentGroupContentSchema.array().nullable(),
})

const contentGroupQueryFields = [
  {
    'translations': [ 'title' ],
  },
  {
    'content': [
      'collection',
      {
        'item': {
          'navigation': navigationQuery,
          'Text_Content': textContentQuery,
          'form': formQueryFields,
          'stopover_hotel_module': stopoverHotelModuleQueryFields
        }
      }
    ]
  }
]

type ContentGroupSchema = z.infer<typeof contentGroupSchema>

export {
  contentGroupSchema,
  contentGroupQueryFields
}

export type {
  ContentGroupSchema
}