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

	const variant = { display, horizontal_alignment, vertical_alignment };
</script>

{#if collectionComponent}
	<div
		class={cn(contentVariant(variant))}
		style="--theme:{theme === 'light' ? '#000000' : '#FFFFFF'};--theme-contrast:{theme === 'light'
			? '#FFFFFF'
			: '#000000'};{area ? `grid-area:${area};` : ''}"
	>
		<svelte:component this={collectionComponent} {item} component={component_name} />
	</div>
{:else}
	{say('collection did not match a component', { collection, collectionComponent })}
{/if}
