import { z } from "zod";

const logosSchema = z.object({
  image: z.string(),
  code: z.string()
})

type LogoSchema = z.infer<typeof logosSchema>

const logoQuery = [ 'image', 'code' ]

const isLogoSchema = (value: unknown): value is LogoSchema => logosSchema.safeParse(value).success

export {
  logosSchema,
  logoQuery,
  isLogoSchema
}

export type {
  LogoSchema
}