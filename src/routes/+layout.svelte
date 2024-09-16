<script>
	import '../app.css';
	import { equals, filter, head, pipe, prop } from 'ramda';
	import { Procesor } from '$lib/components/directus';
	export let data;

	const { environment, siteSettings, layout } = data;

	const { coming_soon_message, environmet_status, maintenance_message } = siteSettings;

	const status = head(
		filter(pipe(prop('environment'), equals(environment)), environmet_status)
	)?.state;
</script>

{#if status}
	{#if status === 'live'}
		<slot></slot>
	{:else if status === 'maintenance'}
		<Procesor {siteSettings} {layout} single_content={maintenance_message} {environment} />
	{:else if status === 'coming-soon'}
		<Procesor {siteSettings} {layout} single_content={coming_soon_message} {environment} />
	{:else if status === 'dark'}
		{console.warn('dark site not configured')}
	{:else}
		{console.warn('status sent is not mapped', status)}
	{/if}
{:else}
	{console.warn('no environment matched: ' + environment, environmet_status)}
{/if}
