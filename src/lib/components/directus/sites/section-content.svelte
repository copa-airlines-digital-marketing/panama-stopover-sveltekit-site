<script lang="ts">
	import type { SectionContentSchema } from '$lib/directus/section';
	import { cn, say } from '$lib/utils';
	import { contentVariant } from '.';
	import { collectionToComponent, DirectusCollectionToValidationMap } from '../utils';

	export let section_content: SectionContentSchema;

	const { collection, component_name, display, horizontal_alignment, item, vertical_alignment } =
		section_content;

	const collectionComponentPromise = collectionToComponent(collection);

	const variant = { display, horizontal_alignment, vertical_alignment };
</script>

{#await collectionComponentPromise}
	...Loading
{:then collectionComponent}
	{#if collectionComponent}
		<div class={cn(contentVariant(variant))}>
			<svelte:component this={collectionComponent} {item} component={component_name} />
		</div>
	{:else}
		{say('collection did not match a component', { collection, collectionComponent })}
	{/if}
{/await}
