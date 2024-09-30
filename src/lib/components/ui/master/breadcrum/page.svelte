<script lang="ts">
	import type { HTMLAttributes } from 'svelte/elements';
	import { cn } from '$lib/utils.js';
	import { getTypography } from '../../foundations/typography';

	type $$Props = HTMLAttributes<HTMLSpanElement> & {
		el?: HTMLSpanElement;
	};

	export let el: $$Props['el'] = undefined;
	export let className: $$Props['class'] = undefined;
	export { className as class };
</script>

<span
	bind:this={el}
	role="link"
	aria-disabled="true"
	aria-current="page"
	class={cn(
		'max-w-28 overflow-hidden text-ellipsis whitespace-nowrap border-b border-b-transparent text-d3 text-grey-600 lg:text-b',
		className
	)}
	{...$$restProps}
>
	<slot />
</span>
