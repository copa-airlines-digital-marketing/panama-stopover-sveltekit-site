import { z } from "zod";
import { logoQuery, logosSchema } from "./logos";

const linkSchema = z.object({
  icon: logosSchema.nullable(),
  text: z.string(),
  href: z.string(),
  target: z.string(),
  referrerpolicy: z.string().array().nullish(),
  rel: z.string().array().nullish(),
  hreflang: z.string().nullish(),
  ping: z.string().nullish()
})

type LinkSchema = z.infer<typeof linkSchema>

const linkQuery = [
  'text',
  'href',
  'target',
  'referrerpolicy',
  'rel',
  'hreflang',
  'ping',
  { 'icon': logoQuery }
]

const isLinkSchema = (value: unknown): value is LinkSchema => linkSchema.safeParse(value).success

export {
  linkSchema,
  linkQuery,
  isLinkSchema
}

export type {
  LinkSchema
}

