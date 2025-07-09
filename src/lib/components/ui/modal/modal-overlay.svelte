<script lang="ts">
	import { cn } from '$lib/utils';
	import { Dialog } from 'bits-ui';
	import { fade } from 'svelte/transition';

	type $$Props = Dialog.OverlayProps;
	type $$Events = Dialog.OverlayEvents;

	let className: $$Props['class'] = undefined;
	export { className as class };
</script>

<Dialog.Overlay
	class={cn('fixed inset-0 z-50 bg-grey-800/65', className)}
	transition={fade}
	transitionConfig={{ duration: 150 }}
></Dialog.Overlay>
