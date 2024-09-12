<script lang="ts">
	import type { SectionContentSchema } from '$lib/directus/section';
	import { collectionToComponent } from './utils';

	export let section_content: SectionContentSchema;

	const {
		collection,
		component_name,
		display,
		horizontal_alignment,
		item,
		theme,
		vertical_alignment
	} = section_content;

	const collectionComponentPromise = collectionToComponent(collection);
</script>

{#await collectionComponentPromise}
	...Loading
{:then collectionComponent}
	{#if collectionComponent}
		<svelte:component this={collectionComponent} {item} component={component_name}
		></svelte:component>
	{/if}
{/await}
