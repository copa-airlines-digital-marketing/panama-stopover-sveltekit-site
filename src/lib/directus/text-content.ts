import { z } from "zod";

const callToActionSchema = z.object({
  text: z.string(),
  link: z.string(),
  open_in: z.string()
})

const textContentTranslations = z.object({
  title: z.string().nullish(),
  description: z.string().nullish(),
  media: z.optional(z.string().nullish()),
  call_to_actions: callToActionSchema.array().nullish(),
  languages_code: z.optional(z.string())
})

const textContentSchema = z.object({
  translations: textContentTranslations.array()
})

const textContentQuery =[{
  'translations': [
    'title',
    'media',
    'description',
    'call_to_actions',
  ]
}]

type TextContentSchema = z.infer<typeof textContentSchema>

const isTextContentSchema = (value: unknown): value is TextContentSchema => textContentSchema.safeParse(value).success

export {
  textContentSchema,
  textContentQuery,
  isTextContentSchema
}

export type {
  TextContentSchema
}
