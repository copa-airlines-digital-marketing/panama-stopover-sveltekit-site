<script>
	import { cn } from '$lib/utils';
	import { getTypography } from '$ui/components/typography';
</script>

<div class={cn(getTypography('body', 'body'), 'mb-6 text-center text-current')}>
	<slot></slot>
</div>
