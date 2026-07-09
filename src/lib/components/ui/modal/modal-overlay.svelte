<script lang="ts">
	import { cn } from '$lib/utils';
	import { Dialog } from 'bits-ui';
	import { fade } from 'svelte/transition';

	type $$Props = Dialog.OverlayProps;

	let className: $$Props['class'] = undefined;
	export { className as class };

	$: overlayProps = {
		class: cn('fixed inset-0 z-50 bg-grey-800/65', className),
		transition: fade,
		transitionConfig: { duration: 150 }
	} as any;
</script>

<Dialog.Overlay {...overlayProps}></Dialog.Overlay>
