<script lang="ts">
	import { ContentGroupContent } from '$lib/components/directus/general-components/content-group';
	import type { ContentGroupSchema } from '$lib/directus/content-group';
	import { isNotEmpty, isNotNil } from 'ramda';

	export let item: ContentGroupSchema;

	const contents = item.content || [];
</script>

<ul class="pillar-grid mb-spacious grid gap-2 md:gap-4">
	{#each contents as content}
		<li>
			{#if isNotNil(content) && isNotEmpty(content)}
				<ContentGroupContent {content}></ContentGroupContent>
			{/if}
		</li>
	{:else}
		<li>No content</li>
	{/each}
</ul>

<style lang="postcss">
	.pillar-grid {
		@apply grid-cols-[repeat(auto-fit,minmax(140px,1fr))] md:grid-cols-[repeat(auto-fit,minmax(320px,1fr))];
	}
</style>
