<script lang="ts">
	import { page } from '$app/stores';
	import { getDirectusImage } from '$lib/components/directus/stopover/utils';
	import type { PageSchema } from '$lib/directus/page';
	import type { SectionSchema } from '$lib/directus/section';
	import { say } from '$lib/utils';
	import { toString } from 'ramda';
	import Section from './section.svelte';

	export let layout: PageSchema;
	export let pageItem: PageSchema;
	export let pageSections: SectionSchema[] | null | undefined;

	const { translations, share_image } = pageItem;

	const { translations: layoutTranslations } = layout;

	const currrentTranslation = translations.filter((t) => t.languages_code === $page.data.locale);

	const currentLayoutTranslation = layoutTranslations.filter(
		(t) => t.languages_code === $page.data.locale
	);

	const sections = pageSections || [];
</script>

<svelte:head>
	<title>{currentLayoutTranslation[0].title_tag} • {currrentTranslation[0].title_tag}</title>
	<meta name="description" content={currrentTranslation[0].meta_description} />
	<meta property="og:title" content={currrentTranslation[0].title_tag} />
	<meta property="og:type" content="article" />
	<meta property="og:url" content={$page.url.href} />
	<meta property="og:image" content="{getDirectusImage(share_image)}?key=19x10-1200" />
	<meta name="twitter:card" content="summary_large_image" />
</svelte:head>

{#each sections as section}
	<Section {section}></Section>
{:else}
	{say(
		`no sections for page with title tag ${currrentTranslation[0].title_tag}`,
		toString(sections)
	)}
{/each}
