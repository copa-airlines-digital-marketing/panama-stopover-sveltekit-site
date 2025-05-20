<script lang="ts">
	import { cn } from '$lib/utils';
	import { Heading } from '$ui/components/typography';
	import type { HTMLAttributes } from 'svelte/elements';

	type $$Props = HTMLAttributes<HTMLDivElement>;

	let className: $$Props['class'] = undefined;
	export { className as class };
</script>

<Heading variant="h4" class={cn('text-primary [grid-area:name]', className)} customcn={cn}>
	<slot />
</Heading>
