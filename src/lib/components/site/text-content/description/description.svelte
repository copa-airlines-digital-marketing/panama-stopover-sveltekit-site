<script lang="ts">
	import { getTypography } from '$lib/components/ui/typography';
	import { descriptionVariants, type DescriptionTheme } from './variants';

	export let description: string | null | undefined;
	export let theme: DescriptionTheme = 'light';
</script>

{#if description}
	<div class={getTypography('body', 'body', descriptionVariants({ theme }))}>
		{@html description}
	</div>
{/if}
