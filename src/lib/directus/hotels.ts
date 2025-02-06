import { z } from "zod";
import { pathSchema } from "./page";
import { locationSchema } from "./location";
import { filesSchema } from "./files";

const hotelTranslationsSchema = z.object({
  lang_code: z.string(),
  name: z.string(),
  description: z.string(),
  url: z.string().nullish(),
  promo_name: z.string().nullish(),
  promo_description: z.string().nullish(),
  path: z.string().nullish()
})

const hotelSchema = z.object({
  main_image: z.string(),
  promo_code: z.string().nullish(),
  promo_discount_amount: z.string().nullish(),
  promo_discount_percent: z.number().nullish(),
  phone_number: z.string(),
  booking_email: z.string(),
  supported_languages: z.string().array(),
  includes: z.string().array(),
  stars: z.number(),
  location: locationSchema,
  use_name: z.boolean(),
  gallery: filesSchema.array(),
  translations: hotelTranslationsSchema.array(),
  parent_page: pathSchema.optional()
})

type HotelSchema = z.infer<typeof hotelSchema>

const isHotelSchema = (value: unknown): value is HotelSchema => hotelSchema.safeParse(value).success

export {
  hotelSchema,
  isHotelSchema,
}

export type { 
  HotelSchema
}