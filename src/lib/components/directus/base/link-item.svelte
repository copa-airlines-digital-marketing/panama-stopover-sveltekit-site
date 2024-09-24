<script lang="ts">
	import { SVG } from '$lib/components/foundations/icon';
	import { cn } from '$lib/utils';
	import type { Props } from '.';

	type $$Props = Props;

	export let item: $$Props['item'];
	export let className: $$Props['class'];
	export { className as class };

	const { href, text, target, hreflang, ping, icon } = item;

	const referrerpolicy = <ReferrerPolicy | undefined | null>item.referrerpolicy?.join(' ');

	const rel = item.rel?.join(' ');
</script>

<a
	{href}
	title={text}
	{target}
	{referrerpolicy}
	{rel}
	{hreflang}
	{ping}
	class={cn(className)}
	{...$$restProps}
>
	{#if icon}
		{icon}
	{:else}
		{text}
	{/if}
</a>
