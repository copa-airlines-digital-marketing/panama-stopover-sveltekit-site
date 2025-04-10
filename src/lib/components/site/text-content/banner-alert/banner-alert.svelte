<script lang="ts">
	import { Alert } from '$lib/components/ui/alerts/alert';
	import type { TextContentSchema } from '$lib/directus/text-content';

	export let item: TextContentSchema;

	const {
		image,
		translations: {
			0: { media, description }
		}
	} = item;
</script>

<Alert>
	{#if description}
		{@html description}
	{/if}
</Alert>
