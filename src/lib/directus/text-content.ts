import { z } from "zod";
import { logoQuery, logosSchema } from "./logos";

const callToActionSchema = z.object({
  text: z.string(),
  link: z.string(),
  open_in: z.string()
})

const textContentTranslations = z.object({
  title: z.string().nullish(),
  description: z.string().nullish(),
  media: z.optional(z.string().nullish()),
  icon: logosSchema.nullable(),
  call_to_actions: callToActionSchema.array().nullish(),
  languages_code: z.optional(z.string())
})

const textContentSchema = z.object({
  image: z.string().nullable(),
  translations: textContentTranslations.array()
})

const textContentQuery =[
  'image',
  { 'translations': [
    'title',
    'media',
    'description',
    'call_to_actions',
    { 'icon': logoQuery },
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
