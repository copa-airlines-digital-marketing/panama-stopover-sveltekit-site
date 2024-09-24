<script lang="ts">
	import type { PageSchema } from '$lib/directus/page';
	import type { PlaceSchema } from '$lib/directus/place-to-visit';
	import type { SiteSettingsSchema } from '$lib/directus/site-settings';
	import { Pre } from '$lib/components/testing';

	export let siteSettings: SiteSettingsSchema;
	export let layout: PageSchema;
	export let stopover_place_to_visit: PlaceSchema;
</script>

<Pre name="Place to Visit" value={stopover_place_to_visit}></Pre>
