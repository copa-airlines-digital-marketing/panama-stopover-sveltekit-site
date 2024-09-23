<script lang="ts">
	import type { HeaderSchema } from '$lib/directus/header';
	import { cn } from '$lib/utils';
	import { Navigation } from '../..';

	export let item: HeaderSchema;
	export let component: string | null;
</script>

<div
	class={cn(
		'my-2 flex items-center justify-between gap-4 rounded-lg bg-backgound-paper px-4 py-1 shadow-md shadow-black/20 md:gap-6'
	)}
>
	{#each item.navigations as navigation}
		<Navigation item={navigation.navigation_id} component={navigation.component} />
	{/each}
</div>
