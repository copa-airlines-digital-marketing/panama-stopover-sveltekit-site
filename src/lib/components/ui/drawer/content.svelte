<script lang="ts">
	import { cn } from '$lib/utils';
	import { Drawer as DrawerPrimitive } from 'vaul-svelte';
	import Overlay from './overlay.svelte';

	type $$Props = DrawerPrimitive.ContentProps;

	let className: $$Props['class'] = undefined;
	export { className as class };
</script>

<DrawerPrimitive.Portal>
	<Overlay />
	<DrawerPrimitive.Content
		class={cn(
			'bg-background-paper fixed inset-x-0 bottom-0 z-50 mt-24 flex h-auto flex-col rounded-t-2xl shadow-lg',
			className
		)}
		{...$$restProps}
	>
		<div class="bg-grey-300 mx-auto mt-4 h-2 w-24 rounded-full"></div>
		<slot />
	</DrawerPrimitive.Content>
</DrawerPrimitive.Portal>
