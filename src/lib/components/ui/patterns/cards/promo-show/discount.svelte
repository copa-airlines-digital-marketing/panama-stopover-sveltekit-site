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
		getTypography('body-small'),
		'col-start-2 row-start-2 mb-2 flex items-end rounded bg-primary text-grey-50 justify-self-end px-2',
		className
	)}
>
	<slot />
</span>
