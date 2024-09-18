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
		theme,
		vertical_alignment
	} = section_content;

	const collectionComponentPromise = collectionToComponent(collection);

	console.log(collection);

	const variant = { display, horizontal_alignment, vertical_alignment };
</script>

{#await collectionComponentPromise}
	...Loading
{:then collectionComponent}
	{#if collectionComponent}
		<div class={cn(contentVariant(variant))}>
			<svelte:component this={collectionComponent} {item} component={component_name} />
		</div>
	{/if}
{/await}
