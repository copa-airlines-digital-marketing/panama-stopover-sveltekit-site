<script lang="ts">
	import type { HTMLAttributes } from 'svelte/elements';
	import { cn } from '$lib/utils';

	type $$Props = HTMLAttributes<HTMLDivElement>;
	export let className: $$Props['class'] = undefined;
	export { className as class };
</script>

<div
	class={cn('embla_slide', className)}
	role="group"
	aria-roledescription="slide"
	{...$$restProps}
>
	<slot />
</div>
