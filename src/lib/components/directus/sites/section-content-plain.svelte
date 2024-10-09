<script lang="ts">
	import type { SectionContentSchema } from '$lib/directus/section';
	import { say } from '$lib/utils';
	import { collectionToComponent } from '../utils';

	export let section_content: SectionContentSchema;

	const { collection, component_name, item, theme, area } = section_content;

	const collectionComponent = collectionToComponent(collection);
</script>

{#if collectionComponent}
	<svelte:component
		this={collectionComponent}
		{item}
		component={component_name}
		style="--theme:{theme === 'light' ? '#000000' : '#FFFFFF'};--theme-contrast:{theme === 'light'
			? '#FFFFFF'
			: '#000000'};{area ? `grid-area:${area};` : ''}"
	/>
{:else}
	{say('collection did not match a component', { collection, collectionComponent })}
{/if}
