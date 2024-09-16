<script>
	import { page } from '$app/stores';
	import { Pre } from '$lib/components/testing/';
	import { equals, filter, pipe, prop } from 'ramda';

	export let data;

	const {
		siteSettings: { error_messages }
	} = data;

	const message = filter(pipe(prop('error_code'), equals($page.status)), error_messages);
</script>

<svelte:head>
	<meta name="robots" content="noindex" />
</svelte:head>

<Pre name="error" value={message}></Pre>
