<script lang="ts">
	import { any, isNotNil } from 'ramda';

	export let site_start_of_page_code: string | null | undefined = undefined;
	export let layout_start_of_page_code: string | null | undefined = undefined;
	export let page_start_of_page_code: string | null | undefined = undefined;
</script>

{#if any(isNotNil, [site_start_of_page_code, layout_start_of_page_code, page_start_of_page_code])}
	{@html page_start_of_page_code || layout_start_of_page_code || site_start_of_page_code}
{/if}
