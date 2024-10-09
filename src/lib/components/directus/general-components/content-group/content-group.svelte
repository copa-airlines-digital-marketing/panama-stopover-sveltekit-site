<script lang="ts">
	import type { ContentGroupSchema } from '$lib/directus/content-group';
	import { componentToConentGroup } from '$lib/components/site/content-group/utils';

	export let item: ContentGroupSchema;
	export let component: string | null;

	const componentToRender = componentToConentGroup(component);
</script>

<svelte:component this={componentToRender} {item}></svelte:component>
