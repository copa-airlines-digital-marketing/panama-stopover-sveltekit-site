<script lang="ts">
	import { cn } from '$lib/utils';
	import type { HTMLAnchorAttributes } from 'svelte/elements';
	import { CallToAction, Discount, Image, Title, Name } from '.';

	type $$Props = HTMLAnchorAttributes;

	let className: $$Props['class'] = undefined;
	export let href: $$Props['href'] = undefined;
	export { className as class };

	let Children = {
		CallToAction,
		Discount,
		Image,
		Name,
		Title
	};
</script>

<a
	{href}
	class={cn(
		'promo-rows grid h-full grid-cols-[8px_1fr_8px] overflow-hidden rounded-lg bg-common-white shadow-md shadow-grey-800/30 md:grid-cols-[16px_1fr_16px]',
		className
	)}
>
	<slot {Children}></slot>
</a>

<style class="postcss">
	.promo-rows {
		grid-template-rows: auto auto auto auto 1fr;
	}
</style>
