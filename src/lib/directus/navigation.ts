import { z } from "zod";
import { logoQuery, logosSchema } from "./logos"
import { linkQuery, linkSchema } from "./links";

const navigationTranslationLinkSchema = z.object({
  links_id: linkSchema
})


const navigationTranslationSchema = z.object({
 languages_code: z.optional(z.string()),
 title: z.string(),
 links: navigationTranslationLinkSchema.array()
})

const navigationSchema = z.object({
  icon: z.optional(logosSchema),
  translations: navigationTranslationSchema.array()
})

type NavigationSchema = z.infer<typeof navigationSchema>

const isNavigationSchema = (value: unknown): value is NavigationSchema => navigationSchema.safeParse(value).success

const navigationQuery = [
  { 'icon': logoQuery },
  { 'translations': [
    'title',
    { 'links': [{ 'links_id': linkQuery }]}
  ] }
]

export {
  navigationSchema,
  navigationQuery,
  isNavigationSchema,
}

export type {
  NavigationSchema
}