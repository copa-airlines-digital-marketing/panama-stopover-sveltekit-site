<script lang="ts">
	import type { ContentGroupContent } from '$lib/directus/content-group';
	import { say } from '$lib/utils';
	import { collectionToComponent } from '../../utils';

	export let content: ContentGroupContent;

	const { collection, component, item } = content;

	const collectionComponent = collectionToComponent(collection);
	const componentItem = item as any;
</script>

{#if collectionComponent && componentItem}
	<svelte:component this={collectionComponent} item={componentItem} {component} />
{:else}
	{say('content group item did not match a renderable component', { collection, collectionComponent, item })}
{/if}
