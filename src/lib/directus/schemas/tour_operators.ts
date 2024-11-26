import { z } from "zod";
import { fieldContactSchema, fieldNetworkSchema } from "./commons";

const tourOperatorSchema = z.object({
    name: z.string(),
    main_image: z.string(),
    contact: fieldContactSchema,
    network: fieldNetworkSchema,
})

type TourOperatorSchema = z.infer<typeof tourOperatorSchema>

export { 
    tourOperatorSchema
}

export type {
    TourOperatorSchema
}
