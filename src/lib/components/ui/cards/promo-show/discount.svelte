<script lang="ts">
	import { getTypography } from '$lib/components/ui/typography';
	import { cn } from '$lib/utils';
	import type { HTMLAttributes } from 'svelte/elements';

	type $$Props = HTMLAttributes<HTMLSpanElement>;

	let className: $$Props['class'] = undefined;
	export { className as class };
</script>

<span
	class={cn(
		getTypography('caption-tiny', 'caption'),
		'col-start-2 row-start-2 mb-2 flex items-end justify-self-end rounded-sm bg-primary px-1.5 py-0.5 text-grey-50 md:px-2.5 md:py-1 md:text-d2',
		className
	)}
>
	<slot />
</span>
