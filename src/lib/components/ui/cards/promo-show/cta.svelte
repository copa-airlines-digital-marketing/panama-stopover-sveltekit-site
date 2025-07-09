<script lang="ts">
	import { cn } from '$lib/utils';
	import { getTypography } from '$ui/components/typography';
	import type { HTMLAttributes } from 'svelte/elements';

	type $$Props = HTMLAttributes<HTMLSpanElement>;

	let className: $$Props['class'] = undefined;
	export { className as class };
</script>

<span
	class={cn(
		getTypography('caption-tiny'),
		'col-start-2 row-start-5 mb-3 mt-1 flex items-end justify-self-end md:text-d1',
		className
	)}
>
	<slot />
</span>
