<script lang="ts">
	import { getTypography } from '$lib/components/ui/typography';
	import { cn } from '$lib/utils';
	import type { HTMLAttributes } from 'svelte/elements';

	type $$Props = HTMLAttributes<HTMLImageElement>;

	let className: $$Props['class'] = undefined;
	export { className as class };
</script>

<span
	class={cn(
		getTypography('caption-tiny'),
		'col-span-3 col-start-1 row-span-2 row-start-1',
		className
	)}
>
	<slot />
</span>
