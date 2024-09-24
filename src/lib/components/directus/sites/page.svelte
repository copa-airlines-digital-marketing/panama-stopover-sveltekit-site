<script lang="ts">
	import type { PageSchema } from '$lib/directus/page';
	import type { SiteSettingsSchema } from '$lib/directus/site-settings';
	import { Pre } from '$lib/components/testing';
	import type { SectionSchema } from '$lib/directus/section';

	export let siteSettings: SiteSettingsSchema;
	export let layout: PageSchema;
	export let page: PageSchema;
	export let pageSections: SectionSchema[];
</script>

<Pre name="Page" value={page}></Pre>
