import { z } from "zod";

const notFoundSchema = z.object({
  'message': z.literal('Error: 404')
})

type NotFoundSchema = z.infer<typeof notFoundSchema>

const isNotFoundSchema = (value: unknown): value is NotFoundSchema => notFoundSchema.safeParse(value).success

export {
  isNotFoundSchema
}