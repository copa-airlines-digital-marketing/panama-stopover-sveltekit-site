<script lang="ts">
	import type { PageSchema } from '$lib/directus/page';
	import type { SiteSettingsSchema } from '$lib/directus/site-settings';
	import type { TextContentSchema } from '$lib/directus/text-content';
	import { Pre } from '$lib/components/testing';
	import { filter, propEq } from 'ramda';

	export let siteSettings: SiteSettingsSchema;
	export let layout: PageSchema;
	export let locale: string;
	export let single_content: TextContentSchema;

	const layoutTranslation = filter(propEq(locale, 'languages_code'), layout.translations)[0];

	const {
		storefronts: {
			0: {
				sections: [header, footer]
			}
		}
	} = layout;
</script>

<svelte:head>
	<title>{layoutTranslation.title_tag}</title>
</svelte:head>

<Pre name="Header" value={header}></Pre>
<Pre name="Single Content" value={single_content}></Pre>
<Pre name="Footer" value={footer} />
