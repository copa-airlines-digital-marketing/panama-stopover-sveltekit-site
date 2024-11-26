import { z } from "zod";
import { partialPromoTranslation } from "./commons";

const transportationSchema = z.object({
    translations: partialPromoTranslation.array(),
})

type TransportationSchema = z.infer<typeof transportationSchema>

export {
    transportationSchema
}

export type {
     TransportationSchema
}