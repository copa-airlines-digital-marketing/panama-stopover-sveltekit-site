<script lang="ts">
	import type { SectionContentSchema } from '$lib/directus/section';
	import { say } from '$lib/utils';
	import { collectionToComponent } from '../utils';

	export let section_content: SectionContentSchema;

	const { collection, component_name, item, theme, area } = section_content;

	const collectionComponent = collectionToComponent(collection) as any;
	const componentItem = item as any;
</script>

{#if collectionComponent && componentItem}
	<svelte:component
		this={collectionComponent}
		item={componentItem}
		component={component_name}
		style="--theme:{theme === 'light' ? '#000000' : '#FFFFFF'};--theme-contrast:{theme === 'light'
			? '#FFFFFF'
			: '#000000'};{area ? `grid-area:${area};` : ''}"
	/>
{:else}
	{say('section content did not match a renderable component', { collection, collectionComponent, item })}
{/if}
