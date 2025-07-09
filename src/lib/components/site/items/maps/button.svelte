<script lang="ts">
	import type { MapProps } from '.';
	import { Button, type ButtonEvents, type ButtonProps } from '$ui/components/button';
	import { cn } from '$lib/utils';

	type $$Props = ButtonProps &
		MapProps & {
			useName?: boolean;
		};
	type $$Events = ButtonEvents;

	let className: $$Props['class'] = undefined;
	export let variant: $$Props['variant'] = 'solid-primary-main';
	export let size: $$Props['size'] = 'default';
	export let href: $$Props['href'] = undefined;
	export let mapTitle: $$Props['mapTitle'] = undefined;
	export let useName: $$Props['useName'] = undefined;
	export let center: $$Props['center'];
	export { className as class };

	const getURL = () => {
		if (href) return window.open(href);

		const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

		const url = isMobile
			? useName
				? `geo:0,0?q=${encodeURIComponent(mapTitle || '')}`
				: `geo:${center.lat},${center.lng}?q=${center.lat},${center.lng}(${mapTitle || ''})`
			: useName
				? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(mapTitle || '')}`
				: `https://www.google.com/maps?q=${center.lat},${center.lng}`;

		window.open(url);
	};
</script>

<Button
	{variant}
	{size}
	class={cn('z-10 cursor-pointer self-end justify-self-end [grid-area:navigate]', className)}
	customcn={cn}
	{...$$restProps}
	on:click={getURL}
>
	<slot />
</Button>
