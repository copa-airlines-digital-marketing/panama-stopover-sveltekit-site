<script lang="ts">
	import { cn } from '$lib/utils';
	import type { HTMLAttributes } from 'svelte/elements';

	type $$Props = HTMLAttributes<HTMLSpanElement>;

	let className: $$Props['class'] = undefined;
	export { className as class };
</script>

<span class={cn('block size-20', className)}>
	<slot />
</span>
