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

	const variant = {
		display: display ? Number(display) as 25 | 50 | 75 | 100 : undefined,
		horizontal_alignment: horizontal_alignment || undefined,
		vertical_alignment: vertical_alignment || undefined
	};
</script>

{#if collectionComponent && componentItem}
	<div
		class={cn(contentVariant(variant))}
		style="--theme:{theme === 'light' ? '#000000' : '#FFFFFF'};--theme-contrast:{theme === 'light'
			? '#FFFFFF'
			: '#000000'};{area ? `grid-area:${area};` : ''}"
	>
		<svelte:component this={collectionComponent} item={componentItem} component={component_name} />
	</div>
{:else}
	{say('section content did not match a renderable component', { collection, collectionComponent, item })}
{/if}
