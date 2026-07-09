<script lang="ts">
	import { page } from '$app/stores';
	import { Procesor } from '$lib/components/directus';
	import { equals, filter, pipe, prop } from 'ramda';

	export let data;

	const { siteSettings } = data;

	const { error_messages } = siteSettings;
	const message = filter(pipe(prop('error_code'), equals($page.status)), error_messages);
</script>

<Procesor single_content={message[0].Text_Content_id} />
