<script lang="ts">
	import { cn } from '$lib/utils';
	import type { HTMLAnchorAttributes } from 'svelte/elements';
	import { CallToAction, Discount, Image, Title } from '.';

	type $$Props = HTMLAnchorAttributes;

	let className: $$Props['class'] = undefined;
	export let href: $$Props['href'] = undefined;
	export { className as class };

	let Children = {
		CallToAction,
		Discount,
		Image,
		Title
	};
</script>

<a
	{href}
	class={cn(
		'grid promo-rows grid-cols-[8px_1fr_8px] overflow-hidden rounded-lg border border-grey-100 bg-common-white shadow-md h-full',
		className
	)}
>
	<slot {Children}></slot>
</a>

<style class="postcss">
	.promo-rows {
		grid-template-rows: auto auto 1fr auto;
	}
</style>
