<script lang="ts">
	import type { SectionSchema } from '$lib/directus/section';
	import { sectionToComponentMap } from '../utils';

	export let section: SectionSchema;

	const component = sectionToComponentMap(section.component);
</script>

<svelte:component this={component} {section}></svelte:component>
