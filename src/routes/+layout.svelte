<script>
	import '../app.css';
	import { Pre } from '$lib/components/testing';
	import { isNotNil } from 'ramda';
	export let data;

	console.log('+layout.svelte');

	/* const {
		language,
		siteSettings: { head_code, start_of_body_code, end_of_body_code, favIcon }
	} = data; */
</script>

<!-- <svelte:head>
	<html lang={language} />
	{#if isNotNil(head_code)}
		{@html head_code}
	{/if}
</svelte:head>

{#if isNotNil(start_of_body_code)}
	{@html start_of_body_code}
{/if}

<Pre name="Head Code" value={start_of_body_code}></Pre>


{#if isNotNil(end_of_body_code)}
{@html end_of_body_code}
{/if}
-->

<slot></slot>
