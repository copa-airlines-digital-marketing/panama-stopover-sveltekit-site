<script lang="ts">
	import { Button } from 'bits-ui';
	import { iconnedVariants, type IconnedCTAProps } from './variants';
	import { cn } from '$lib/utils';
	import IconCtaIcon from './icon-cta-icon.svelte';

	type $$Props = IconnedCTAProps;

	let className: $$Props['class'] = undefined;
	export { className as class };
	export let theme: $$Props['theme'] = 'DEFAULT';
</script>

<Button.Root class={cn(iconnedVariants({ theme }), className)}>
	<slot Icon={IconCtaIcon} />
</Button.Root>
