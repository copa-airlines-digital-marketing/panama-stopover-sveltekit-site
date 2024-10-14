<script lang="ts">
	import { getTypography } from '$lib/components/ui/foundations/typography';
	import { cn } from '$lib/utils';
	import type { HTMLAttributes } from 'svelte/elements';

	type $$Props = HTMLAttributes<HTMLSpanElement>;

	let className: $$Props['class'] = undefined;
	export { className as class };
</script>

<span
	class={cn(
		getTypography('body'),
		'col-start-2 row-start-3 mb-3 mt-3 flex items-end self-start font-bold text-primary-dark',
		className
	)}
>
	<slot />
</span>
