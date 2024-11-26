import { z } from "zod";
import { partialPromoTranslation } from "./commons";

// TODO complete schema
const tourSchema = z.object({
    translations: partialPromoTranslation.array(),
})

type TourSchema = z.infer<typeof tourSchema>

export {
    tourSchema
}

export type {
    TourSchema
}