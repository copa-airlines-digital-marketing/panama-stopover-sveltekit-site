import type { PageSchema } from "./page"
import type { SiteSettingsSchema } from "./site-settings"
import type { TextContentSchema } from "./text-content"

interface Schema {
  sites: SiteSettingsSchema
  Text_Content: TextContentSchema
  pages: PageSchema
}

export type {
  Schema
}