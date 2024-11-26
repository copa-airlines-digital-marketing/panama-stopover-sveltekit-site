import type { HeaderSchema } from "./header"
import type { HotelAmenity } from "./hotel-amenities"
import type { HotelSchema } from "./hotels"
import type { LinkSchema } from "./links"
import type { LogoSchema } from "./logos"
import type { NavigationSchema } from "./navigation"
import type { PageSchema } from "./page"
import type { PlaceSchema } from "./place-to-visit"
import type { RestaurantSchema } from "./restaurants"
import type { PackageSchema } from "./schemas/packages"
import type { TourOperatorSchema } from "./schemas/tour_operators"
import type { TourSchema } from "./schemas/tours"
import type { TransportationSchema } from "./schemas/transportation"
import type { SectionContentSchema, SectionSchema } from "./section"
import type { SiteSettingsSchema } from "./site-settings"
import type { TextContentSchema } from "./text-content"

interface Schema {
  //Basic
  hotel_amenities: HotelAmenity
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
  pages: PageSchema
  sections: SectionSchema
  sections_section_content: SectionContentSchema
  sites: SiteSettingsSchema
  //Panama Stopover
  stopover_hotels: HotelSchema
  stopover_restaurants: RestaurantSchema
  stopover_place_to_visit: PlaceSchema
  stopover_tours: TourSchema
  stopover_tour_operator: TourOperatorSchema
  stopover_package: PackageSchema
  stopover_transportation: TransportationSchema
}

export type {
  Schema
}