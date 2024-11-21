import { z } from "zod";

const fieldContactSchema = z.object({
    form: z.union([z.literal('phone'), z.literal('whatsapp'), z.literal('email')]),
    contact: z.string()
}).array()

const fieldNetworkSchema = z.object({
    network: z.string(),
    link: z.string(),
}).array()

const partialPromoTranslation = z.object({
    name: z.string(),
    description: z.string().nullish(),
    promo_name: z.string().nullish(),
    promo_description: z.string().nullish(),
    url: z.string().nullish(),
    path: z.string(),
    languages_code: z.string(),
})

const partialPromoValues = z.object({
    promocode: z.string().nullish(),
    promo_discount_amount: z.number().nullish(),
    promo_discount_percent: z.number().nullish(),
})

export {
    fieldContactSchema,
    fieldNetworkSchema,
    partialPromoTranslation,
    partialPromoValues  
}