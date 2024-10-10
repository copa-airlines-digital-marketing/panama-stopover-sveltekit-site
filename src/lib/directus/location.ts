import { z } from "zod"

const locationSchema = z.object({
  type: z.string(),
  coordinates: z.number().array()
})

export {
  locationSchema
}