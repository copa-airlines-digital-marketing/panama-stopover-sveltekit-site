<script lang="ts">
	import { ScrollArea } from 'bits-ui';
	import { getModalContext, modalBodyVariants, type BodyProps } from '.';
	import { cn } from '$lib/utils';

	type $$Props = BodyProps;

	let className: $$Props['class'] = undefined;
	export let size: $$Props['size'] = undefined;
	export { className as class };

	const modalProps = getModalContext();

	$: props = modalProps ? $modalProps : modalProps;
</script>

<ScrollArea.Root type="auto" dir="ltr">
	<ScrollArea.Viewport class="h-full w-full">
		<div class={cn(modalBodyVariants({ size: size || props?.size }), className)} {...$$restProps}>
			<slot />
		</div>
	</ScrollArea.Viewport>
	<ScrollArea.Scrollbar
		orientation="vertical"
		class="flex h-full w-3 touch-none select-none rounded-lg bg-grey-100"
	>
		<ScrollArea.Thumb class="relative flex-1 rounded-lg bg-grey-200 " />
	</ScrollArea.Scrollbar>
</ScrollArea.Root>
