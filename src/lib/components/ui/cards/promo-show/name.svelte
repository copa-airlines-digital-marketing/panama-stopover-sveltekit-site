<script lang="ts">
	import { cn } from '$lib/utils';
	import { getTypography } from '$ui/components/typography';
	import type { HTMLAttributes } from 'svelte/elements';

	type $$Props = HTMLAttributes<HTMLSpanElement>;

	let className: $$Props['class'] = undefined;
	export { className as class };
</script>

<span
	class={cn(getTypography('body-small', 'body'), 'col-start-2 row-start-4 mb-6 text-d1', className)}
>
	<slot />
</span>
