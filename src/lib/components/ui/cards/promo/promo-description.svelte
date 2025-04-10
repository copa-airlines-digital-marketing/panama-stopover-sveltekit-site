<script>
	import { getTypography } from '$lib/components/ui/typography';
	import { cn } from '$lib/utils';
</script>

<div class={cn(getTypography('body', 'body'), 'mb-6 text-center text-current')}>
	<slot></slot>
</div>
