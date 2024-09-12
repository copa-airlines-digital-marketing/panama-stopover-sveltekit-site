import { z } from "zod";

const logosSchema = z.object({
  image: z.string(),
  code: z.string()
})

type LogoSchema = z.infer<typeof logosSchema>

const logoQuery = [ 'image', 'code' ]

export {
  logosSchema,
  logoQuery
}

export type {
  LogoSchema
}