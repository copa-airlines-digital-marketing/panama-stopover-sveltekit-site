<script lang="ts">
	import { cn } from '$lib/utils';
	import { getTypography } from '$ui/components/typography';
	import type { HTMLAttributes } from 'svelte/elements';

	type $$Props = HTMLAttributes<HTMLDivElement>;

	let className: $$Props['class'] = undefined;
	export { className as class };
</script>

<div
	class={cn(
		getTypography('body-small', 'body'),
		'mb-6 rounded-lg bg-system-warning px-2 py-3 text-common-black shadow-md md:px-6',
		className
	)}
>
	<slot />
</div>
