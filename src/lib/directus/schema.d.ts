import type { HeaderSchema } from "./header"
import type { HotelSchema } from "./hotels"
import type { LinkSchema } from "./links"
import type { LogoSchema } from "./logos"
import type { NavigationSchema } from "./navigation"
import type { PageSchema } from "./page"
import type { PlaceSchema } from "./place-to-visit"
import type { RestaurantSchema } from "./restaurants"
import type { SiteSettingsSchema } from "./site-settings"
import type { TextContentSchema } from "./text-content"

interface Schema {
  //General Content
  icons: LogoSchema
  links: LinkSchema
  logos: LogoSchema
  Text_Content: TextContentSchema
  //Components
  navigation: NavigationSchema
  //Blocks
  header: HeaderSchema
  //Website
  sites: SiteSettingsSchema
  pages: PageSchema,
  //Panama Stopover
  stopover_hotels: HotelSchema,
  stopover_restaurants: RestaurantSchema,
  stopover_place_to_visit: PlaceSchema
}

export type {
  Schema
}