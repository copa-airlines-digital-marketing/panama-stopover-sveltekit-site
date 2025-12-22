<script>
	import { getTypographyVariant } from '$lib/components/ui/foundations/typography';
	import { cn } from '$lib/utils';
</script>

<span class={cn(getTypographyVariant('display-big'), 'text-grey-50')}>
	<slot />
</span>
