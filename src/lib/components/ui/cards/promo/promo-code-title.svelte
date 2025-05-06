<script>
	import { getTypography } from '$lib/components/ui/typography';

	import { cn } from '$lib/utils';
</script>

<div class={cn(getTypography('caption-small', 'caption'), 'mb-2 text-center text-current')}>
	<slot />
</div>
