import { z } from "zod";

const logosSchema = z.object({
  name: z.string().optional(),
  image: z.string(),
  code: z.string()
})

type LogoSchema = z.infer<typeof logosSchema>

const logoQuery = [ 'image', 'code' ]

const logoQueryExtended = [ 'name', 'image', 'code' ]

const isLogoSchema = (value: unknown): value is LogoSchema => logosSchema.safeParse(value).success

export {
  logosSchema,
  logoQuery,
  logoQueryExtended,
  isLogoSchema
}

export type {
  LogoSchema
}