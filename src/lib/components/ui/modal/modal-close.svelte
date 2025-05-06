<script lang="ts">
	import { Dialog } from 'bits-ui';
	import { buttonVariants } from '$ui/components/button';
	import { CloseIcon } from '$lib/components/ui/icon';
	import { cn } from '$lib/utils';

	type $$Props = Dialog.CloseProps;
	type $$Events = Dialog.CloseEvents;

	let className: $$Props['class'] = undefined;
	export { className as class };
</script>

<div class="-mt-11 flex w-full justify-end px-2 pt-2">
	<Dialog.Close
		class={cn(buttonVariants({ variant: 'transparent-primary-main' }), className, 'font-jakarta')}
		{...$$restProps}
	>
		<CloseIcon class="size-5 fill-current" />
	</Dialog.Close>
</div>
