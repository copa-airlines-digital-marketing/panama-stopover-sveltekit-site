<script lang="ts">
	import type { TextContentSchema } from '$lib/directus/text-content';
	import { Pre } from '../../testing';
	import { textContentToComponentMap } from './utils';

	export let item: TextContentSchema;
	export let component: string | null;

	const mappedComponent = textContentToComponentMap(component);
</script>

{#if mappedComponent}
	<svelte:component this={mappedComponent} {item} />
{:else}
	<Pre name="Text_Content: {component}" value={item} />
{/if}
