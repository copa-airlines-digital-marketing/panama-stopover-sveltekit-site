import { z } from "zod";
import { pathSchema } from "./page";
import { filesSchema } from "./files";
import { locationSchema } from "./location";

const restaurantTranslationsSchema = z.object({
  lang_code: z.string(),
  name: z.string(),
  description: z.string(),
  url: z.string().nullish(),
  promo_name: z.string().nullish(),
  promo_description: z.string().nullish(),
  path: z.string()
})

const restaurantSchema = z.object({
  main_image: z.string(),
  gallery: filesSchema.array(),
  translations: restaurantTranslationsSchema.array(),
  promo_code: z.string().nullish(),
  promo_discount_amount: z.string().nullish(),
  promo_discount_percent: z.number().nullish(),
  whatsapp: z.string().nullish(),
  supported_languages: z.string().array(),
  type: z.string().array(),
  meals: z.string().array(),
  cuisines: z.string().array(),
  location: locationSchema,
  parent_page: pathSchema.optional()
})

type RestaurantSchema = z.infer<typeof restaurantSchema>

const isRestaurantSchema = (value: unknown): value is RestaurantSchema => restaurantSchema.safeParse(value).success

export {
  restaurantSchema,
  isRestaurantSchema,
}

export type { 
  RestaurantSchema
}