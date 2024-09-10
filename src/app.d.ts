// See https://kit.svelte.dev/docs/types#app

import type { SiteSettingsSchema } from "$lib/directus/site-settings";

// for information about these interfaces
declare global {
	namespace App {
		// interface Error {}
		interface Locals {
      siteSettings: SiteSettingsSchema
    }
		// interface PageData {}
		// interface PageState {}
		// interface Platform {}
	}
}

export {};
