<script lang="ts">
	import { getTypography, getTypographyVariant } from '$lib/components/ui/foundations/typography';
	import { cn } from '$lib/utils';
	import type { HTMLAttributes } from 'svelte/elements';

	type $$Props = HTMLAttributes<HTMLSpanElement>;

	let className: $$Props['class'] = undefined;
	export { className as class };
</script>

<span
	class={cn(
		getTypographyVariant('body'),
		'sm:text- col-start-2 row-start-3 mb-3 mt-3 flex items-end self-start text-d1 font-bold text-primary-dark sm:text-b',
		className
	)}
>
	<slot />
</span>
