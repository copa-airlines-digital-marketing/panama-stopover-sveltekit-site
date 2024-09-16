<script lang="ts">
	import type { PageSchema } from '$lib/directus/page';
	import type { SiteSettingsSchema } from '$lib/directus/site-settings';
	import type { TextContentSchema } from '$lib/directus/text-content';
	import { Pre } from '$lib/components/testing';

	export let siteSettings: SiteSettingsSchema;
	export let layout: PageSchema;
	export let single_content: TextContentSchema;
</script>

<Pre name="Single Content" value={single_content}></Pre>
