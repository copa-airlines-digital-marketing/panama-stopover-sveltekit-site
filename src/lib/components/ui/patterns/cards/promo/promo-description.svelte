<script>
	import { getTypography } from '$lib/components/ui/foundations/typography';
	import { cn } from '$lib/utils';
</script>

<div class={cn(getTypography('body', 'body'), 'mb-6 text-center text-current')}>
	<slot></slot>
</div>
