<script lang="ts">
	import type { PageSchema } from '$lib/directus/page';
	import type { RestaurantSchema } from '$lib/directus/restaurants';
	import type { SiteSettingsSchema } from '$lib/directus/site-settings';
	import { Pre } from '$lib/components/testing';

	export let siteSettings: SiteSettingsSchema;
	export let layout: PageSchema;
	export let stopover_restaurants: RestaurantSchema;
</script>

<Pre name="Restaurant" value={stopover_restaurants}></Pre>
