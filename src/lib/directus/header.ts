import { z } from "zod";
import { navigationQuery, navigationSchema } from "./navigation";

const HeaderNavigationSchema = z.object({
  navigation_id: navigationSchema,
  component: z.string().nullable()
})

const headerSchema = z.object({
  include_search: z.boolean(),
  navigations: z.array(HeaderNavigationSchema)
})

type HeaderSchema = z.infer<typeof headerSchema>

const headerQuery = [
  'include_search',
  { 'navigations': [
    'component',
    { 'navigation_id': navigationQuery }  
  ]}
]

const isHeaderSchema = (value: unknown): value is HeaderSchema => headerSchema.safeParse(value).success

export {
  headerSchema,
  headerQuery,
  isHeaderSchema
}

export type {
  HeaderSchema
}