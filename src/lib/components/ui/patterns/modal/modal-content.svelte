<script lang="ts">
	import { cn, flyAndScale } from '$lib/utils';
	import { Dialog } from 'bits-ui';
	import { ModalOverlay, ModalPortal, modalVariants, setModalContext, type ModalProps } from '.';

	type $$Props = ModalProps;
	type $$Events = Dialog.ContentEvents;

	let className: $$Props['class'] = undefined;
	export let size: $$Props['size'] = 'normal';
	export { className as class };

	$: size && setModalContext({ size });
</script>

<ModalPortal>
	<ModalOverlay />
	<Dialog.Content
		transition={flyAndScale}
		class={cn(modalVariants({ size }), className)}
		{...$$restProps}
	>
		<slot />
	</Dialog.Content>
</ModalPortal>
