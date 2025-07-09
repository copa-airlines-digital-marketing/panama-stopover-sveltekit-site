<script lang="ts">
	import type { HeaderSchema } from '$lib/directus/header';
	import { cn } from '$lib/utils';
	import { Navigation } from '../..';

	export let item: HeaderSchema;
</script>

<div
	class={cn(
		'bg-background-paper my-2 flex items-center justify-between gap-4 rounded-lg px-4 py-1 shadow-md shadow-black/20 md:gap-6'
	)}
>
	{#each item.navigations as navigation}
		<Navigation item={navigation.navigation_id} component={navigation.component} />
	{/each}
</div>
