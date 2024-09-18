<script lang="ts">
	import type { SectionSchema } from '$lib/directus/section';
	import { SectionContent } from '$lib/components/directus';
	import { landmarkToTag } from '../utils';
	import { isNotNil } from 'ramda';
	import { cn } from '$lib/utils';
	import { containerVariant, sectionVariants } from '.';

	export let section: SectionSchema;

	const {
		id,
		section_id,
		landmark,
		background_color,
		vertical_spacing,
		horizontal_behaviour,
		content_spacing,
		content_horizontal_alignment,
		content_horizontal_distribution,
		content_vertical_alignment,
		content_vertical_distribution,
		section_content
	} = section;

	const variantObject = {
		vertical_spacing,
		content_spacing,
		content_horizontal_alignment,
		content_horizontal_distribution,
		content_vertical_alignment,
		content_vertical_distribution
	};
</script>

<svelte:element
	this={landmarkToTag(landmark)}
	id={section_id || undefined}
	class={cn(containerVariant({ horizontal_behaviour }))}
	style="background-color:{background_color || 'transparent'};"
>
	{#if isNotNil(section_content)}
		{#each section_content as item}
			<div
				class={cn(sectionVariants(variantObject))}
				class:col-start-2={horizontal_behaviour === 'container-grid'}
			>
				<SectionContent section_content={item} />
			</div>
		{:else}
			{console.warn('no content for section: ' + id)}
		{/each}
	{:else}
		{console.warn('no content for section: ' + id)}
	{/if}
</svelte:element>
