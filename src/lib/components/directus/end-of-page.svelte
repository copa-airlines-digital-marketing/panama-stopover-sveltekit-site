<script lang="ts">
	import { any, isNotNil } from 'ramda';

	export let site_end_of_page_code: string | null | undefined = undefined;
	export let layout_end_of_page_code: string | null | undefined = undefined;
	export let page_end_of_page_code: string | null | undefined = undefined;
</script>

{#if any(isNotNil, [site_end_of_page_code, layout_end_of_page_code, page_end_of_page_code])}
	{@html page_end_of_page_code || layout_end_of_page_code || site_end_of_page_code}
{/if}
