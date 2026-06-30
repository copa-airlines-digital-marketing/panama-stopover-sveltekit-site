<script lang="ts">
	import { cn, flyAndScale } from '$lib/utils';
	import { Dialog } from 'bits-ui';
	import { ModalOverlay, ModalPortal, modalVariants, setModalContext, type ModalProps } from '.';

	type $$Props = ModalProps;

	let className: $$Props['class'] = undefined;
	export let size: $$Props['size'] = 'normal';
	export { className as class };

	$: size && setModalContext({ size });
	$: contentProps = {
		transition: flyAndScale,
		class: cn(modalVariants({ size }), className),
		...$$restProps
	} as any;
</script>

<ModalPortal>
	<ModalOverlay />
	<Dialog.Content {...contentProps}>
		<slot />
	</Dialog.Content>
</ModalPortal>
