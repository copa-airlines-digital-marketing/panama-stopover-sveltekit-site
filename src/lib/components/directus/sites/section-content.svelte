<script lang="ts">
	import type { SectionContentSchema } from '$lib/directus/section';
	import { cn, say } from '$lib/utils';
	import { contentVariant } from '.';
	import { collectionToComponent } from '../utils';

	export let section_content: SectionContentSchema;

	const {
		collection,
		component_name,
		display,
		horizontal_alignment,
		item,
		vertical_alignment,
		theme,
		area
	} = section_content;

	const collectionComponent = collectionToComponent(collection);
	const componentItem = item as any;
	const shouldSpanFullContainer = collection === 'block_flight_search_form';

	const variant = {
		display: shouldSpanFullContainer ? 100 : display ? Number(display) as 25 | 50 | 75 | 100 : undefined,
		horizontal_alignment: shouldSpanFullContainer ? undefined : horizontal_alignment || undefined,
		vertical_alignment: vertical_alignment || undefined
	};
</script>

{#if collectionComponent && componentItem}
	<div
		class={cn(contentVariant(variant), shouldSpanFullContainer && 'justify-self-stretch')}
		style="--theme:{theme === 'light' ? '#000000' : '#FFFFFF'};--theme-contrast:{theme === 'light'
			? '#FFFFFF'
			: '#000000'};{area ? `grid-area:${area};` : ''}"
	>
		<svelte:component this={collectionComponent} item={componentItem} component={component_name} />
	</div>
{:else}
	{say('section content did not match a renderable component', { collection, collectionComponent, item })}
{/if}
