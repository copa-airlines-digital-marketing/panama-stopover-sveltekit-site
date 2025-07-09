<script lang="ts">
	import { Button } from 'bits-ui';
	import Title from './title.svelte';
	import Label from './label.svelte';
	import Icon from './icon.svelte';
	import Arrow from './arrow.svelte';
	import Additional from './additional.svelte';
	import { linkBarVariants } from '.';
	import type { VariantProps } from 'tailwind-variants';
	import { cn } from '$lib/utils';
	import { setLinkBarContext } from './context';

	type $$Props = Button.Props & {
		variant?: VariantProps<typeof linkBarVariants>['variant'];
		lablel?: boolean;
	};

	type $$Events = Button.Events;

	let className: $$Props['class'] = undefined;
	export { className as class };
	export let label: $$Props['lablel'] = false;
	export let variant: $$Props['variant'] = 'DEFAULT';
	export let builders: $$Props['builders'] = [];

	const children = {
		Additional,
		Icon,
		Label,
		Title
	};

	setLinkBarContext(!!label);
</script>

<Button.Root
	{builders}
	class={cn(linkBarVariants({ variant }), className)}
	{...$$restProps}
	on:click
>
	<slot {children} />
	<Arrow />
</Button.Root>
