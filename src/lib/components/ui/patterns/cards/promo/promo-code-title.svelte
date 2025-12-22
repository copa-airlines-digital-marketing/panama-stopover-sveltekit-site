<script>
	import { getTypography } from '$lib/components/ui/foundations/typography';

	import { cn } from '$lib/utils';
</script>

<div class={cn(getTypography('caption-small', 'caption'), 'text-center text-current')}>
	<slot />
</div>
