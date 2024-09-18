<script lang="ts">
	import { any, isNotNil } from 'ramda';

	export let site_head_code: string | null | undefined = undefined;
	export let layout_head_code: string | null | undefined = undefined;
	export let page_head_code: string | null | undefined = undefined;
	export let indexPage: boolean;
</script>

<svelte:head>
	{#if !indexPage}
		<meta name="robots" content="noindex" />
	{/if}
	{#if any(isNotNil, [site_head_code, layout_head_code, page_head_code])}
		{@html page_head_code || layout_head_code || site_head_code}
	{/if}
</svelte:head>
