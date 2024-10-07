import { z } from "zod";

const formMethodSchema = z.union([
  z.literal('POST'),
  z.literal('GET')
])

const formInputOptionsSchema = z.object({
  value: z.string(),
  label: z.string()
})

const formInputSchema = z.object({
  name: z.string(),
  label: z.string(),
  placeholder: z.string().nullable(),
  type: z.string(),
  value: z.string().nullable(),
  required: z.boolean().nullable(),
  checked: z.boolean().nullable(),
  options: formInputOptionsSchema.array().nullable(),
  options_api: z.string().nullable(),
  max: z.number().nullable(),
  min: z.number().nullable(),
  step: z.number().nullable()
})

const formTranslationSchema = z.object({
  languages_code: z.string().optional(),
  inputs: formInputSchema.array()
})

const formSchema = z.object({
  action: z.string().nullable(),
  method: formMethodSchema,
  translations: formTranslationSchema.array().nullable()
})

const formQueryFields = [
  'action',
  'method',
  {
    'translations': [ 'inputs' ]
  }
]

type FormSchema = z.infer<typeof formSchema>

export {
  formSchema,
  formQueryFields
}

export type {
  FormSchema
}