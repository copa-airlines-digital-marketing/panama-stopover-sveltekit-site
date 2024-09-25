<script lang="ts">
	import type { EmblaOptionsType, EmblaPluginType, EmblaCarouselType } from 'embla-carousel';
	import type { HTMLAttributes } from 'svelte/elements';
	import emblaCarouselSvelte from 'embla-carousel-svelte';
	import { default as Slide } from './carousel-slide.svelte';
	import { cn } from '$lib/utils';
	import { createEventDispatcher, onMount } from 'svelte';
	import { browser } from '$app/environment';

	type $$Props = HTMLAttributes<HTMLDivElement> & {
		options?: EmblaOptionsType;
		plugins?: EmblaPluginType[];
		selected: number;
	};

	const dispatch = createEventDispatcher();

	export let className: $$Props['class'] = undefined;
	export { className as class };
	export let options: $$Props['options'] = {
		loop: false
	};
	export let plugins: $$Props['plugins'] = [];
	export let selected = 0;

	let emblaApi: EmblaCarouselType | undefined = undefined;

	function changeSelection(value: number) {
		if (!emblaApi || emblaApi.selectedScrollSnap() === value) return;
		emblaApi.scrollTo(value);
	}

	function onSelect() {
		if (!emblaApi) return;
		dispatch('select', emblaApi.selectedScrollSnap());
	}

	const onInit = (event: CustomEvent<EmblaCarouselType>) => {
		if (!browser) return;

		emblaApi = event.detail;

		emblaApi.on('select', onSelect);
	};

	$: changeSelection(selected);
</script>

<div
	class="relative w-full overflow-hidden"
	use:emblaCarouselSvelte={{ options: options ?? {}, plugins: plugins ?? [] }}
	on:emblaInit={onInit}
	role="region"
	aria-roledescription="carousel"
>
	<div class={cn('', className)} {...$$restProps}>
		<slot {Slide} {emblaApi} />
	</div>
</div>
