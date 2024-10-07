import { z } from "zod";
import { contentGroupQueryFields, contentGroupSchema } from "./content-group";

const groupTranslation = z.object({
  languages_code: z.string().optional(),
  title: z.string().nullable()
})

const groupsGroupSchema = z.object({
  content_group_id: contentGroupSchema
})

const groupsSchema = z.object({
  translations: groupTranslation.array().nullable(),
  groups: groupsGroupSchema.array().nullable()
})

const groupSchemaQueryFields = [
  {
    'translations': [ 'title' ],
  },
  {
    'groups': [{
      'content_group_id': contentGroupQueryFields
    }]
  }
]

type GroupsSchema = z.infer<typeof groupsSchema>

export {
  groupsSchema,
  groupSchemaQueryFields,
}

export type { 
  GroupsSchema
}