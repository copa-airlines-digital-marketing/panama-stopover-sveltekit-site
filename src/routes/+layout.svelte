<script>
	import '../app.css';
	import { Pre } from '$lib/components/testing';
	import { equals, filter, head, pipe, prop } from 'ramda';
	export let data;

	const {
		environment,
		siteSettings: { coming_soon_message, environmet_status, maintenance_message },
		layout
	} = data;

	const status = head(
		filter(pipe(prop('environment'), equals(environment)), environmet_status)
	)?.state;
</script>

<Pre name="Layout" value={layout}></Pre>

{#if status}
	{#if status === 'live'}
		<slot></slot>
	{:else if status === 'maintenance'}
		<Pre name="Maintenance" value={maintenance_message}></Pre>
	{:else if status === 'coming-soon'}
		<Pre name="Coming soon" value={coming_soon_message}></Pre>
	{:else if status === 'dark'}
		{console.warn('dark site not configured')}
	{:else}
		{console.warn('status sent is not mapped', status)}
	{/if}
{:else}
	{console.warn('no environment matched: ' + environment, environmet_status)}
{/if}
