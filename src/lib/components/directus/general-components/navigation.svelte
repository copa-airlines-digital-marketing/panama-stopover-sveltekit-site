<script lang="ts">
	import type { NavigationSchema } from '$lib/directus/navigation';
	import { say } from '$lib/utils';
	import { componentNameToComponentMap } from './utils';

	export let item: NavigationSchema;
	export let component: string | null;

	const svelteComponent = componentNameToComponentMap(component);
</script>

{#if svelteComponent}
	<svelte:component this={svelteComponent} navigation={item}></svelte:component>
{:else}
	{say('could not resolve component', component)}
{/if}
