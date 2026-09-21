<script lang="ts">
	import type { HTMLAttributes } from 'svelte/elements';
	import { cn } from '$lib/utils.js';
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
		'max-w-full min-w-0 overflow-hidden border-b border-b-transparent text-d3 text-ellipsis whitespace-nowrap text-grey-600 lg:text-b',
		className
	)}
	{...$$restProps}
>
	<slot />
</span>
