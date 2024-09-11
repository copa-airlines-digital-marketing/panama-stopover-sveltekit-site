import { z } from "zod";
import { logosSchema } from "./logos";

const navigationItemSchema = z.object({
  icon: z.optional(logosSchema),
  text: z.string(),
  href: z.string(),
  target: z.optional(z.string()),
  referrerpolicy: z.optional(z.string().array()),
  rel: z.optional(z.string().array()),
  hreflang: z.optional(z.string()),
  ping: z.optional(z.string())
})

const navigationTranslationSchema = z.object({
 languages_code: z.optional(z.string()),
 title: z.string(),
 items: navigationItemSchema.array()
})

const navigationSchema = z.object({
  icon: z.optional(logosSchema),
  translations: navigationTranslationSchema.array()
})

type NavigationSchema = z.infer<typeof navigationSchema>

const isNavigationSchema = (value: unknown): value is NavigationSchema => navigationSchema.safeParse(value).success

export {
  navigationSchema,
  isNavigationSchema,
}

export type {
  NavigationSchema
}