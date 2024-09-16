<script lang="ts">
	import type { HotelSchema } from '$lib/directus/hotels';
	import type { PageSchema } from '$lib/directus/page';
	import type { SiteSettingsSchema } from '$lib/directus/site-settings';
	import { Pre } from '$lib/components/testing';

	export let siteSettings: SiteSettingsSchema;
	export let layout: PageSchema;
	export let stopover_hotels: HotelSchema;
</script>

<Pre name="Hotels" value={stopover_hotels}></Pre>
