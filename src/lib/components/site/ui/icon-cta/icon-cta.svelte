<script lang="ts">
	import { Button } from 'bits-ui';
	import { iconnedVariants, type IconnedCTAProps } from './variants';
	import { default as Icon } from './icon-cta-icon.svelte';
	import { cn } from '$lib/utils';

	type $$Props = IconnedCTAProps;

	let className: $$Props['class'] = undefined;
	export { className as class };
	export let theme: $$Props['theme'] = 'DEFAULT';
</script>

<Button.Root class={cn(iconnedVariants({ theme }), className)} {...$$restProps}>
	<slot {Icon} />
</Button.Root>
