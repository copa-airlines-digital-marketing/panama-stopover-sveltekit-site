<script lang="ts">
	import { cn } from '$lib/utils';
	import type { HTMLLiAttributes } from 'svelte/elements';
	type $$Props = HTMLLiAttributes;
	let className: $$Props['class'] = undefined;
	export { className as class };
</script>

<li class={cn('flex flex-col items-center gap-1', className)} {...$$restProps}>
	<slot />
</li>
