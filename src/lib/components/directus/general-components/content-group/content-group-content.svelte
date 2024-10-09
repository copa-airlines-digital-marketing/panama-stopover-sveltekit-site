<script lang="ts">
	import type { ContentGroupContent } from '$lib/directus/content-group';
	import { say } from '$lib/utils';
	import { collectionToComponent } from '../../utils';

	export let content: ContentGroupContent;

	const { collection, component, item } = content;

	const collectionComponent = collectionToComponent(collection);
</script>

{#if collectionComponent}
	<svelte:component this={collectionComponent} {item} {component} />
{:else}
	{say('collection did not match a component', { collection, collectionComponent })}
{/if}
