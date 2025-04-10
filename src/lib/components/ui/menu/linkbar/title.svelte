<script>
	import { getTypographyVariant } from '$lib/components/ui/typography';
	import { cn } from '$lib/utils';
	import { getLinkBarContext } from './context';

	let hasLabel = getLinkBarContext();
</script>

<span
	class={cn(
		getTypographyVariant(
			'h4',
			'col-start-2 row-span-2 ml-4 flex-grow self-center text-current sm:ml-6'
		),
		{
			'row-span-1 row-start-2 self-start': $hasLabel
		}
	)}
>
	<slot />
</span>
