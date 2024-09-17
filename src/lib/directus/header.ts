import { z } from "zod";
import { navigationQuery, navigationSchema } from "./navigation";

const HeaderNavigationSchema = z.object({
  navigation_id: navigationSchema,
  component: z.string().nullish()
})

const headerSchema = z.object({
  include_search: z.boolean(),
  navigations: z.array(HeaderNavigationSchema)
})

type HeaderSchema = z.infer<typeof headerSchema>

const headerQuery = [
  'include_search',
  { 'navigations': [
    { 'navigation_id': navigationQuery }  
  ]}
]

export {
  headerSchema,
  headerQuery
}

export type {
  HeaderSchema
}