import type { HeaderSchema } from './header';
import type { FlightSearchFormSchema } from './flight-search-form';
import type { HotelAmenity } from './hotel-amenities';
import type { HotelSchema } from './hotels';
import type { LinkSchema } from './links';
import type { LogoSchema } from './logos';
import type { NavigationSchema } from './navigation';
import type { PageSchema } from './page';
import type { PlaceSchema } from './place-to-visit';
import type { RestaurantSchema } from './restaurants';
import type { PackageSchema } from '../domain/packages';
import type { TourOperatorSchema } from './schemas/tour_operators';
import type { TourSchema } from '../domain/tours';
import type { TransportationSchema } from '../domain/transportation';
import type { SectionContentSchema, SectionSchema } from './section';
import type { SiteSettingsSchema } from './site-settings';
import type { StopoverHotelModuleSchema } from './stopover_hotel_module';
import type { TextContentSchema } from './text-content';

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
	block_flight_search_form: FlightSearchFormSchema;
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
	stopover_hotel_module: StopoverHotelModuleSchema;
}

export type { Schema };
