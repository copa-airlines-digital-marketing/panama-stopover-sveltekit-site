<script>
	import { cn } from '$lib/utils';
	import { getTypography } from '$ui/components/typography';
</script>

<div class={cn(getTypography('caption-small', 'caption'), 'mb-2 text-center text-current')}>
	<slot />
</div>
