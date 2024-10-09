<script lang="ts">
	import { ContentGroupContent } from '$lib/components/directus/general-components/content-group';
	import { getTabContext } from '$lib/components/directus/section/tabs/context';
	import type { ContentGroupSchema } from '$lib/directus/content-group';
	import { isNotEmpty, isNotNil } from 'ramda';

	export let item: ContentGroupSchema;

	const title = item.translations?.[0]?.title;

	const contents = item.content || [];

	let tabContext = getTabContext();

	$tabContext = $tabContext.concat([title || 'add a a title']);
</script>

{#each contents as content}
	{#if isNotNil(content) && isNotEmpty(content)}
		<ContentGroupContent {content}></ContentGroupContent>
	{/if}
{:else}
	<div>No content</div>
{/each}
