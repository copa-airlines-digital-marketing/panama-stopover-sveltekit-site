<script lang="ts">
	import type { PageSchema } from '$lib/directus/page';
	import { isNotNil } from 'ramda';
	import { Section as SectionComponent } from '$lib/components/directus';

	export let page: PageSchema;

	const {
		share_image,
		translatations: {
			0: { title_tag, meta_description }
		},
		index,
		head_code,
		start_of_body_code,
		end_of_body_code,
		storefronts: {
			0: { sections }
		}
	} = page;
</script>

<svelte:head>
	<title>{title_tag}</title>
	<meta name="description" content={meta_description} />
	<meta property="og:image" content="http://example.com/logo.jpg" />
	{#if head_code}
		{@html head_code}
	{/if}
</svelte:head>

{#if start_of_body_code}
	{@html start_of_body_code}
{/if}

{#if isNotNil(sections)}
	{#each sections as section}
		<SectionComponent {section} />
	{/each}
{/if}

{#if end_of_body_code}
	{@html end_of_body_code}
{/if}
