<script lang="ts">
	import { cn } from '$lib/utils';
	import { getTypographyVariant } from '$ui/components/typography';
	import type { HTMLAttributes } from 'svelte/elements';

	type $$Props = HTMLAttributes<HTMLSpanElement>;

	let className: $$Props['class'] = undefined;
	export { className as class };
</script>

<span
	class={cn(
		getTypographyVariant('h4'),
		'mt-4 text-center font-bold text-grey-50 md:text-u2',
		className
	)}
	style="grid-area: title;"
>
	<slot />
</span>
