<script>
	import { getTypography } from '$lib/components/ui/foundations/typography';
	import { cn } from '$lib/utils';
</script>

<h2 class={cn(getTypography('caption', 'caption'), 'mb-2 text-center text-current')}>
	<slot />
</h2>
