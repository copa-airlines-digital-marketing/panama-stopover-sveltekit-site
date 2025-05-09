<script>
	import { cn } from '$lib/utils';
	import { getTypographyVariant } from '$ui/components/typography';
</script>

<span class={cn(getTypographyVariant('display-big'), 'text-grey-50')}>
	<slot />
</span>
