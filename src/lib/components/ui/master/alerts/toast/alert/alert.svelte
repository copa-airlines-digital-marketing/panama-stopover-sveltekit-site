<script lang="ts">
	import { getTypography, getTypographyVariant } from '$lib/components/ui/foundations/typography';
	import { cn } from '$lib/utils';
	import type { HTMLAttributes } from 'svelte/elements';

	type $$Props = HTMLAttributes<HTMLDivElement>;

	let className: $$Props['class'] = undefined;
	export { className as class };
</script>

<div
	class={cn(
		getTypography('caption', 'caption'),
		'rounded-lg bg-stopover-accent text-grey-700 shadow-md',
		className
	)}
>
	<slot />
</div>
