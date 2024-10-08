<script lang="ts">
	import type { SectionSchema } from '$lib/directus/section';
	import { cn } from '$lib/utils';
	import { isNotNil, isEmpty } from 'ramda';
	import { containerVariant, sectionVariants } from '../../sites';
	import { landmarkToTag } from '../../utils';
	import { SectionContent } from '../..';
	import { Accordion } from 'bits-ui';

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
	class={cn(containerVariant({ horizontal_behaviour }), '')}
	style="--section-color:{background_color || 'transparent'};background-color:{background_color ||
		'transparent'};"
>
	{#if isNotNil(section_content) && !isEmpty(section_content)}
		<div
			class={cn(sectionVariants(variantObject))}
			class:col-start-2={horizontal_behaviour === 'container-grid'}
		>
			<Accordion.Root class="col-span-full">
				{#each section_content as item, i}
					<Accordion.Item value={[section_id, id, i].join('-')}>
						<SectionContent section_content={item} />
					</Accordion.Item>
				{/each}
			</Accordion.Root>
		</div>
	{:else}
		{console.warn('no content for section: ' + id)}
	{/if}
</svelte:element>
