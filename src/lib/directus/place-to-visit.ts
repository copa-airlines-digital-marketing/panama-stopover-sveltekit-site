import { z } from "zod";
import { textContentSchema } from "./text-content";
import { filesSchema } from "./files";
import { locationSchema } from "./location";

const placeTranslationsSchema = z.object({
  lang_code: z.string(),
  name: z.string(),
  description: z.string(),
  url: z.string().nullish(),
  promo_name: z.string().nullish(),
  promo_description: z.string().nullish(),
  path: z.string()
})

const placeSchema = z.object({
  main_image: z.string(),
  gallery: filesSchema.array(),
  translations: placeTranslationsSchema.array(),
  promo_code: z.string().nullish(),
  promo_discount_amount: z.string().nullish(),
  promo_discount_percent: z.number().nullish(),
  supported_languages: z.string().array().nullish(),
  experiences: textContentSchema.array().nullish(),
  duration: z.string(),
  pilar: z.string(),
  category: z.string().array(),
  location: locationSchema
})

type PlaceSchema = z.infer<typeof placeSchema>

const isPlaceSchema = (value: unknown): value is PlaceSchema => placeSchema.safeParse(value).success

export {
  placeSchema,
  isPlaceSchema,
}

export type { 
  PlaceSchema
}