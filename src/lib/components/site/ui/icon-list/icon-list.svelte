<script lang="ts">
	import { cn } from '$lib/utils';
	import { default as Item } from './icon-list-item.svelte';
	import type { HTMLAttributes } from 'svelte/elements';
	type $$Props = HTMLAttributes<HTMLUListElement>;
	let className: $$Props['class'] = undefined;
	export { className as class };
</script>

<ul
	class={cn('grid grid-cols-[repeat(auto-fill,minmax(100px,1fr))] justify-center', className)}
	{...$$restProps}
>
	<slot {Item} />
</ul>
