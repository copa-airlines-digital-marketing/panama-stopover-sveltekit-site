<script>
	import { Pre } from '$lib/components/testing';
	import { isNotNil } from 'ramda';

	export let data;

	const { siteSettings, layout, page } = data;
</script>

<Pre name="page" value={data.page}></Pre>

{#if isNotNil(page.end_of_body_code) || isNotNil(layout.end_of_body_code) || isNotNil(siteSettings.end_of_body_code)}
	{@html page.end_of_body_code || layout.end_of_body_code || siteSettings.end_of_body_code}
{/if}
