<script lang="ts">
	import { cn } from '$lib/utils';
	import { Heading } from '$ui/components/typography';
	import type { HTMLAttributes } from 'svelte/elements';

	type $$Props = HTMLAttributes<HTMLDivElement>;

	let className: $$Props['class'] = undefined;
	export { className as class };
</script>

<Heading variant="h3" class={cn('', className)} customcn={cn}>
	<slot />
</Heading>
