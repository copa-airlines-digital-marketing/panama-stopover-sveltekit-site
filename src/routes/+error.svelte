<script>
	import { page } from '$app/stores';
	import { Procesor } from '$lib/components/directus';
	import { equals, filter, pipe, prop } from 'ramda';

	export let data;

	const { environment, siteSettings, layout, layoutSections, locale } = data;

	const { error_messages } = siteSettings;
	const message = filter(pipe(prop('error_code'), equals($page.status)), error_messages);
</script>

<Procesor
	{siteSettings}
	{layout}
	{layoutSections}
	single_content={message}
	{environment}
	{locale}
/>
