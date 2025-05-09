<script lang="ts">
	import { cn } from '$lib/utils';
	import { getTypography } from '$ui/components/typography';
	import type { HTMLAttributes } from 'svelte/elements';

	type $$Props = HTMLAttributes<HTMLSpanElement>;

	let className: $$Props['class'] = undefined;
	export { className as class };
</script>

<span
	class={cn(getTypography('body'), 'text-grey-0 text-center font-bold', className)}
	style="grid-area: image;"
>
	<slot />
</span>
