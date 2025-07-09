<script lang="ts">
	import type { HTMLAttributes } from 'svelte/elements';
	import List from './list.svelte';

	type $$Props = HTMLAttributes<HTMLElement> & {
		el?: HTMLElement;
	};

	export let el: $$Props['el'] = undefined;
	let className: $$Props['class'] = undefined;
	export { className as class };
</script>

<nav class={className} bind:this={el} aria-label="breadcrumb" {...$$restProps}>
	<slot {List} />
</nav>
