<script lang="ts">
	import { cn } from '$lib/utils';
	import type { HTMLAnchorAttributes } from 'svelte/elements';
	import { CallToActions, Image, Title } from '.';

	type $$Props = HTMLAnchorAttributes;

	let className: $$Props['class'] = undefined;
	export let href: $$Props['href'] = undefined;
	export { className as class };
</script>

<a {href} class={cn('pillard-card grid overflow-hidden rounded-lg shadow-lg', className)}>
	<slot {Title} {Image} {CallToActions} />
</a>

<style lang="postcss">
	.pillard-card {
		grid-template-areas: '. title .' '. cta .';
		grid-template-columns: [image-start] 16px 1fr 16px [image-end];
		grid-template-rows: [image-start] auto 1fr [image-end];
	}
</style>
