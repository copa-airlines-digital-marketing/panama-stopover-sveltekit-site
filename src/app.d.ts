// See https://kit.svelte.dev/docs/types#app

import type { HotelSchema } from '$lib/domain/hotels';
import type { RestaurantSchema } from '$lib/domain/restaurants';
import type { PlaceSchema } from '$lib/domain/places';
import type { PackageSchema } from '$lib/domain/packages';
import type { PageSchema } from '$lib/domain/pages';
import type { SectionSchema } from '$lib/domain/sections';
import type { SiteSettingsSchema } from '$lib/directus/site-settings';
import type { TransportationSchema } from '$lib/domain/transportation';
import type { TourSchema } from '$lib/domain/tours';

// for information about these interfaces
declare global {
	namespace App {
		// interface Error {}
		interface Locals {
			locale: string;
		}

		interface PageData {
			isMobile: boolean;
			environment: string;
			siteSettings: SiteSettingsSchema;
			layout: PageSchema;
			layoutSections: SectionSchema[];
			locale: string;
			page?: PageSchema;
			pageSections?: SectionSchema[];
			stopover_hotels?: HotelSchema;
			stopover_place_to_visit?: PlaceSchema;
			stopover_restaurants?: RestaurantSchema;
			stopover_package?: PackageSchema;
			stopover_transportation?: TransportationSchema;
			stopover_tour?: TourSchema;
		}
		// interface PageState {}
		// interface Platform {}
	}
}

export {};
