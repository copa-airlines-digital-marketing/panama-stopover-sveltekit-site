import { z } from "zod";
import { partialPromoTranslation, partialPromoValues } from "./commons";

//Todo complete the schema
const packageSchema = z.object({
    days: z.number(),  
    translations: partialPromoTranslation.array()
})

type PackageSchema = z.infer<typeof packageSchema>

export {
    packageSchema
}

export type {
    PackageSchema
}

