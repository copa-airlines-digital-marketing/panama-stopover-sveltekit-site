import { z } from "zod";

const pageTranslationsSchema = z.object({
  languages_code: z.string(),
  path: z.string(),
  title_tag: z.string(),
  meta_description: z.string()
})

type PageTranslationSchema = z.infer<typeof pageTranslationsSchema>

type PathSchema = {
  translations: {
    languages_code: string
    path: string
    title_tag: string
  }[],
  parent?: PathSchema | null
}

type PageSchema = {
  id: number,
  share_image: string
  translations: PageTranslationSchema[]
  index: boolean
  head_code: string | null
  start_of_body_code: string | null
  end_of_body_code: string | null
  parent?: PathSchema | null
}

const translatedPathField = { 'translations': ['path', 'languages_code', 'title_tag']}

const pagePathFields = [
  translatedPathField,
  {'parent': [
    translatedPathField,
    {'parent': [
      translatedPathField,
      {'parent': [
        translatedPathField
      ]}
    ]}
  ]}
]

const pathSchema: z.ZodType<PathSchema> = z.lazy(() => z.object({
  translations: z.object({ path: z.string(), languages_code: z.string(), title_tag: z.string() }).array(),
  parent: pathSchema.optional().nullable()
}))

const pageSchema: z.ZodType<PageSchema> = z.lazy(() => z.object({
  id: z.number(),
  share_image: z.string().nullable(),
  translations: pageTranslationsSchema.array(),
  index: z.boolean(),
  head_code: z.string().nullable(),
  start_of_body_code: z.string().nullable(),
  end_of_body_code: z.string().nullable(),
  parent: pathSchema.optional().nullable()
}))


const isPageSettings = (value: unknown): value is PageSchema => pageSchema.safeParse(value).success

export {
  pageSchema,
  pathSchema,
  pagePathFields,
  isPageSettings
}

export type {
  PageSchema,
  PathSchema
}