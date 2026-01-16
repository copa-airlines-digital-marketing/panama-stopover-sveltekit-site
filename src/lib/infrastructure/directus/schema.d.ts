import type { HeaderSchema } from '../../directus/header';
import type { HotelAmenity } from '../../directus/hotel-amenities';
import type { HotelSchema } from '../../domain/hotels';
import type { LinkSchema } from '../../directus/links';
import type { LogoSchema } from '../../directus/logos';
import type { NavigationSchema } from '../../directus/navigation';
import type { PageSchema } from '../../domain/pages';
import type { PlaceSchema } from '../../domain/places';
import type { RestaurantSchema } from '../../domain/restaurants';
import type { PackageSchema } from '../../directus/schemas/packages';
import type { TourOperatorSchema } from '../../directus/schemas/tour_operators';
import type { TourSchema } from '../../directus/schemas/tours';
import type { TransportationSchema } from '../../directus/schemas/transportation';
import type { SectionContentSchema, SectionSchema } from '../../domain/sections';
import type { SiteSettingsSchema } from '../../directus/site-settings';
import type { TextContentSchema } from '../../directus/text-content';

interface Schema {
	//Basic
	hotel_amenities: HotelAmenity;
	//General Content
	icons: LogoSchema;
	links: LinkSchema;
	logos: LogoSchema;
	Text_Content: TextContentSchema;
	//Components
	navigation: NavigationSchema;
	//Blocks
	header: HeaderSchema;
	//Website
	pages: PageSchema;
	sections: SectionSchema;
	sections_section_content: SectionContentSchema;
	sites: SiteSettingsSchema;
	//Panama Stopover
	stopover_hotels: HotelSchema;
	stopover_restaurants: RestaurantSchema;
	stopover_place_to_visit: PlaceSchema;
	stopover_tour: TourSchema;
	stopover_tour_operator: TourOperatorSchema;
	stopover_package: PackageSchema;
	stopover_transportation: TransportationSchema;
}

export type { Schema };
