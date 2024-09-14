<script>
	import '../app.css';
	import { Pre } from '$lib/components/testing';
	import { isNotNil, equals, filter, head, pipe, prop } from 'ramda';
	export let data;

	console.log('+layout.svelte');

	const {
		environment,
		siteSettings: {
			coming_soon_message,
			end_of_body_code,
			environmet_status,
			favIcon,
			head_code,
			logo,
			maintenance_message,
			start_of_body_code
		},
		layout
	} = data;

	const status = head(
		filter(pipe(prop('environment'), equals(environment)), environmet_status)
	)?.state;
</script>

<svelte:head>
	{#if isNotNil(head_code)}
		{@html head_code}
	{/if}
</svelte:head>

{#if isNotNil(start_of_body_code)}
	{@html start_of_body_code}
{/if}

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

{#if isNotNil(end_of_body_code)}
	{@html end_of_body_code}
{/if}
