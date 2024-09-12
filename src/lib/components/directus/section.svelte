<script lang="ts">
	import type { SectionSchema } from '$lib/directus/section';
	import { SectionContent } from '$lib/components/directus';
	import { landmarkToTag } from './utils';
	import { isNotNil } from 'ramda';

	export let section: SectionSchema;

	const {
		id,
		section_id,
		landmark,
		horizontal_behaviour,
		content_spacing,
		content_horizontal_aligment,
		content_horizontal_distribution,
		content_vertical_alignment,
		content_vertical_distribution,
		background_color,
		section_content
	} = section;
</script>

<svelte:element this={landmarkToTag(landmark)} id={section_id || undefined}>
	{#if isNotNil(section_content)}
		{#each section_content as item}
			<SectionContent section_content={item} />
		{:else}
			{console.warn('no content for section: ' + id)}
		{/each}
	{:else}
		{console.warn('no content for section: ' + id)}
	{/if}
</svelte:element>
