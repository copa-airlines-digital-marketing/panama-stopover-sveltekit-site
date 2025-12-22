<script lang="ts">
	import { cn } from '$lib/utils';
	import { getModalContext, modalFooterVariant, type FooterProps } from '.';

	type $$Props = FooterProps;

	let className: $$Props['class'] = undefined;
	export let size: $$Props['size'] = undefined;
	export { className as class };

	const modalProps = getModalContext();

	$: props = modalProps ? $modalProps : modalProps;
</script>

<div class={cn(modalFooterVariant({ size: size || props?.size }), className)} {...$$restProps}>
	<slot />
</div>
