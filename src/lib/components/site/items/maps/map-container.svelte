<script lang="ts">
	import { cn } from '$lib/utils';
	import type { HTMLAttributes } from 'svelte/elements';
	import Button from './button.svelte';
	import Title from './title.svelte';
	import Static from './static.svelte';

	type $$Props = HTMLAttributes<HTMLDivElement>;

	let className: $$Props['class'] = undefined;
	export { className as class };

	const children = {
		Button,
		Title,
		Static
	};
</script>

<div class={cn('overlay-layout relative grid', className)} {...$$restProps}>
	<slot {...children} />
</div>

<style lang="postcss">
	.overlay-layout {
		grid-template-columns: [image_start] 8px [name_start] auto [name_end] 1fr [navigate_start] auto [navigate_end] 8px [image_end];
		grid-template-rows: [image_start] 8px [name_start] auto [name_end] 1fr [navigate_start] auto [navigate_end] 8px [image_end];
	}
</style>
