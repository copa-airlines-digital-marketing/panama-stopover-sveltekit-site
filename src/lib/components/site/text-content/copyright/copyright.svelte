<script lang="ts">
	import { getTypography } from '$lib/components/ui/foundations/typography';
	import type { TextContentSchema } from '$lib/directus/text-content';
	import { cn } from '$lib/utils';

	export let item: TextContentSchema;

	const {
		translations: {
			0: { description }
		}
	} = item;
</script>

{#if description}
	<div class={cn(getTypography('body-small'), 'text-center text-grey-600')}>
		{@html description}
	</div>
{:else}
	Description is required for copyrights
{/if}
