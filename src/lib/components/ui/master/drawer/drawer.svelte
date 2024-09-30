<script lang="ts">
	import { Drawer as DrawerPrimitive } from 'vaul-svelte';
	import Content from './content.svelte';

	type $$Props = DrawerPrimitive.Props;
	export let shouldScaleBackground: $$Props['shouldScaleBackground'] = true;
	export let open: $$Props['open'] = false;
	export let activeSnapPoint: $$Props['activeSnapPoint'] = undefined;
</script>

<DrawerPrimitive.Root {shouldScaleBackground} bind:open bind:activeSnapPoint {...$$restProps}>
	<slot {Content} Trigger={DrawerPrimitive.Trigger} />
</DrawerPrimitive.Root>
