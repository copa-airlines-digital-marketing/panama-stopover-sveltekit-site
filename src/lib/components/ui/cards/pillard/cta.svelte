<script lang="ts">
	import { buttonVariants } from '$ui/components/button';
	import { cn } from '$lib/utils';
	import type { HTMLAttributes } from 'svelte/elements';

	type $$Props = HTMLAttributes<HTMLSpanElement>;

	let className: $$Props['class'] = undefined;
	export { className as class };
</script>

<span
	class={cn(
		buttonVariants({ size: 'slim' }),
		'mb-2 self-end md:justify-self-center',
		className
	)}
	style="grid-area: cta;"
>
	<slot />
</span>
