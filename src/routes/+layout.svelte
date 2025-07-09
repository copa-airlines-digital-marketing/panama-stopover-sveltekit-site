<script>
	import '../app.css';
	import { equals, filter, head, pipe, prop } from 'ramda';
	import { Procesor } from '$lib/components/directus';
	import { Toast } from '$lib/components/ui/alerts/toast';

	export let data;

	const { environment, siteSettings, layout, layoutSections, locale } = data;

	const { coming_soon_message, environmet_status, maintenance_message } = siteSettings;

	const status = head(
		filter(pipe(prop('environment'), equals(environment)), environmet_status)
	)?.state;
</script>

{#if status}
	{#if status === 'live'}
		<slot></slot>
	{:else if status === 'maintenance'}
		<Procesor
			{siteSettings}
			{layout}
			{layoutSections}
			single_content={maintenance_message}
			{environment}
			{locale}
		/>
	{:else if status === 'coming-soon'}
		<Procesor
			{siteSettings}
			{layout}
			{layoutSections}
			single_content={coming_soon_message}
			{environment}
			{locale}
		/>
	{:else if status === 'dark'}
		{console.warn('dark site not configured')}
	{:else}
		{console.warn('status sent is not mapped', status)}
	{/if}
{:else}
	{console.warn('no environment matched: ' + environment, environmet_status)}
{/if}

<Toast />
