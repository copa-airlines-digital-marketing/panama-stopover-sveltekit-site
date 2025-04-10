<script lang="ts">
	import { getTypography, getTypographyVariant } from '$lib/components/ui/typography';
	import { cn } from '$lib/utils';
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
