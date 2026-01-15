// See https://kit.svelte.dev/docs/types#app

import type { HotelSchema } from '$lib/domain/hotels';
import type { StopoverPackageQuery } from '$lib/domain/packages';
import type { PageSchema } from '$lib/domain/pages';
import type { PlaceSchema } from '$lib/domain/places';
import type { RestaurantSchema } from '$lib/domain/restaurants';
import type { SectionSchema } from '$lib/domain/sections';
import type { SiteSettingsSchema } from '$lib/directus/site-settings';
import type { TransportationQuery } from '$lib/domain/transportation';

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
			layoutSections: SectionSchema;
			locale: string;
			page?: PageSchema;
			pageSections?: SectionSchema;
			stopover_hotels?: HotelSchema;
			stopover_place_to_visit?: PlaceSchema;
			stopover_restaurants?: RestaurantSchema;
			stopover_package?: StopoverPackageQuery;
			stopover_transportation?: TransportationQuery;
		}
		// interface PageState {}
		// interface Platform {}
	}
}

export {};
