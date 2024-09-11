import { z } from "zod";

const callToActionSchema = z.object({
  text: z.string(),
  link: z.string(),
  open_in: z.string()
})

const textContentTranslations = z.object({
  title: z.string().nullable(),
  description: z.string().nullable(),
  media: z.optional(z.string().nullable()),
  call_to_actions: z.nullable(callToActionSchema.array()),
  languages_code: z.optional(z.string())
})

const textContentSchema = z.object({
  translations: textContentTranslations.array()
})

type TextContentSchema = z.infer<typeof textContentSchema>

export {
  textContentSchema
}

export type {
  TextContentSchema
}
