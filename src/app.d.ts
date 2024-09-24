// See https://kit.svelte.dev/docs/types#app

import type { HotelSchema } from "$lib/directus/hotels";
import type { PageSchema } from "$lib/directus/page";
import type { PlaceSchema } from "$lib/directus/place-to-visit";
import type { RestaurantSchema } from "$lib/directus/restaurants";
import type { SectionSchema } from "$lib/directus/section";
import type { SiteSettingsSchema } from "$lib/directus/site-settings";

// for information about these interfaces
declare global {
	namespace App {
		// interface Error {}
		interface Locals {
      locale: string
    }

		interface PageData {
      environment: string,
      siteSettings: SiteSettingsSchema,
      layout: PageSchema,
      layoutSections: SectionSchema,
      locale: string,
      page?: PageSchema,
      pageSections?: SectionSchema,
      stopover_hotels?: HotelSchema,
      stopover_place_to_visit?: PlaceSchema,
      stopover_restaurants?: RestaurantSchema
    }
		// interface PageState {}
		// interface Platform {}
	}
}

export {};
