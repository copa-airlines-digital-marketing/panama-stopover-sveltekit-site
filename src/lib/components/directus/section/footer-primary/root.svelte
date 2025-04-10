<script lang="ts">
	import type { SectionSchema } from '$lib/directus/section';
	import { cn } from '$lib/utils';
	import { isNotNil } from 'ramda';
	import { containerVariant } from '../../sites';
	import { landmarkToTag } from '../../utils';
	import { SectionContent } from '../..';

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
	class={cn(containerVariant({ horizontal_behaviour }), 'p-4 pb-16')}
	style="background-color:{background_color || 'transparent'};"
>
	{#if isNotNil(section_content)}
		<div class="footer-primary container mx-auto grid justify-items-center gap-4">
			{#each section_content as item}
				<SectionContent section_content={item} />
			{:else}
				{console.warn('no content for section: ' + id)}
			{/each}
		</div>
	{:else}
		{console.warn('no content for section: ' + id)}
	{/if}
</svelte:element>

<style lang="postcss">
	.footer-primary {
		@apply [grid-template-areas:'logo''lang''legal''social''copyright'];
	}
</style>
