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
	<slot {Button} {Title} {Static} />
</div>

<style lang="postcss">
	.overlay-layout {
		grid-template-columns: [image-start] 8px [name-start] auto [name-end] 1fr [navigate-start] auto [navigate-end] 8px [image-end];
		grid-template-rows: [image-start] 8px [name-start] auto [name-end] 1fr [navigate-start] auto [navigate-end] 8px [image-end];
	}
</style>
