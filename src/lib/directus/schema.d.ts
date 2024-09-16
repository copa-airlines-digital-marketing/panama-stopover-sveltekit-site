import type { HotelSchema } from "./hotels"
import type { PageSchema } from "./page"
import type { PlaceSchema } from "./place-to-visit"
import type { RestaurantSchema } from "./restaurants"
import type { SiteSettingsSchema } from "./site-settings"
import type { TextContentSchema } from "./text-content"

interface Schema {
  sites: SiteSettingsSchema
  Text_Content: TextContentSchema
  pages: PageSchema,
  stopover_hotels: HotelSchema,
  stopover_restaurants: RestaurantSchema,
  stopover_place_to_visit: PlaceSchema
}

export type {
  Schema
}