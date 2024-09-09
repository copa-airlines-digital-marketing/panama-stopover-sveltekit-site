import { z } from "zod";

const logosSchema = z.object({
  image: z.string(),
  code: z.string()
})

type LogoSchema = z.infer<typeof logosSchema>

export {
  logosSchema
}

export type {
  LogoSchema
}