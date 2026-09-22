<script lang="ts">
	import type { HeroBlock } from '$lib/directus/hero';
	import HeroSlide from './hero-slide.svelte';
	import emblaCarouselSvelte from 'embla-carousel-svelte';
	import type { EmblaCarouselType } from 'embla-carousel';
	import { onMount, tick } from 'svelte';
	import { createHeroPlayback } from './hero-playback';
	export let item: HeroBlock;
	let root: HTMLElement;
	let controls: HTMLDivElement;
	let api: EmblaCarouselType | undefined;
	let playback: ReturnType<typeof createHeroPlayback> | undefined;
	let selected = 0,
		ready = false,
		playing = false,
		progress = 0,
		reduceMotion = false;
	let controlTop = 12,
		positioned = false,
		disposed = false;
	const labels = {
		es: {
			name: 'Destacados',
			carousel: 'carrusel',
			slide: 'diapositiva',
			previous: 'Anterior',
			next: 'Siguiente',
			of: 'de',
			play: 'Reproducir carrusel',
			pause: 'Pausar carrusel'
		},
		en: {
			name: 'Highlights',
			carousel: 'carousel',
			slide: 'slide',
			previous: 'Previous',
			next: 'Next',
			of: 'of',
			play: 'Play carousel',
			pause: 'Pause carousel'
		},
		pt: {
			name: 'Destaques',
			carousel: 'carrossel',
			slide: 'slide',
			previous: 'Anterior',
			next: 'Próximo',
			of: 'de',
			play: 'Reproduzir carrossel',
			pause: 'Pausar carrossel'
		}
	};
	$: copy = labels[item.locale];
	const number = (value: number) => String(value).padStart(2, '0');
	function measure() {
		if (disposed || !root || !controls) return;
		const active = root.querySelectorAll<HTMLElement>('.slide')[selected];
		const photo = active?.querySelector<HTMLElement>('.hero-photo')?.getBoundingClientRect();
		const content = active?.querySelector<HTMLElement>('.hero-copy')?.getBoundingClientRect();
		if (!photo || !content) return;
		const origin = root.getBoundingClientRect();
		const buttons = controls.getBoundingClientRect();
		let top = photo.bottom - origin.top - buttons.height - 28;
		// Localized copy can be taller or wider. Keep controls above it when they intersect.
		const shift = photo.left - origin.left;
		if (buttons.left < content.right - shift && buttons.right > content.left - shift)
			top = Math.min(top, content.top - origin.top - buttons.height - 16);
		controlTop = Math.max(photo.top - origin.top + 12, top);
		positioned = true;
	}
	async function sync() {
		selected = api?.selectedScrollSnap() || 0;
		playback?.reset();
		await tick();
		measure();
	}
	function pause() {
		playback?.pause();
	}
	function init(event: CustomEvent<EmblaCarouselType>) {
		api = event.detail;
		ready = true;
		api.on('select', sync).on('reInit', sync).on('pointerDown', pause);
		void sync();
	}
	function go(direction: -1 | 1) {
		pause();
		playback?.reset();
		if (direction === 1) api?.scrollNext(reduceMotion);
		else api?.scrollPrev(reduceMotion);
	}
	function toggle() {
		if (playing) pause();
		else if (ready) playback?.play();
	}
	onMount(() => {
		playback = createHeroPlayback({
			advance: () => api?.scrollNext(reduceMotion),
			state: (value) => (playing = value),
			progress: (value) => (progress = value)
		});
		const enter = () => playback?.suspend('hover');
		const leave = () => playback?.resume('hover');
		const visibility = () => {
			if (document.hidden) pause();
		};
		const query = matchMedia('(prefers-reduced-motion: reduce)');
		const motion = () => {
			reduceMotion = query.matches;
			playback?.setReducedMotion(reduceMotion);
		};
		motion();
		if (root.matches(':hover')) enter();
		root.addEventListener('mouseenter', enter);
		root.addEventListener('mouseleave', leave);
		root.addEventListener('focusin', pause);
		document.addEventListener('visibilitychange', visibility);
		window.addEventListener('pagehide', pause);
		query.addEventListener('change', motion);
		const observer = new ResizeObserver(measure);
		observer.observe(root);
		root
			.querySelectorAll('.hero-photo, .hero-copy')
			.forEach((element) => observer.observe(element));
		void tick().then(measure);
		return () => {
			disposed = true;
			playback?.destroy();
			observer.disconnect();
			api?.off('select', sync).off('reInit', sync).off('pointerDown', pause);
			root.removeEventListener('mouseenter', enter);
			root.removeEventListener('mouseleave', leave);
			root.removeEventListener('focusin', pause);
			document.removeEventListener('visibilitychange', visibility);
			window.removeEventListener('pagehide', pause);
			query.removeEventListener('change', motion);
		};
	});
</script>

<section
	bind:this={root}
	class="hero-carousel"
	aria-label={copy.name}
	aria-roledescription={copy.carousel}
>
	{#if ready}
		<div bind:this={controls} class="controls" class:positioned style:top={`${controlTop}px`}>
			<button
				type="button"
				class="play-toggle"
				aria-label={playing ? copy.pause : copy.play}
				title={playing ? copy.pause : copy.play}
				on:click={toggle}
			>
				{#if !reduceMotion}<svg
						class="progress-ring"
						width="40"
						height="40"
						viewBox="0 0 40 40"
						aria-hidden="true"
						><circle class="ring-track" cx="20" cy="20" r="17" /><circle
							class="ring-value"
							cx="20"
							cy="20"
							r="17"
							pathLength="100"
							stroke-dasharray="100"
							stroke-dashoffset={100 - progress * 100}
						/></svg
					>{/if}
				<svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"
					>{#if playing}<path d="M6 5h4v14H6zM14 5h4v14h-4z" />{:else}<path
							d="M8 5v14l11-7z"
						/>{/if}</svg
				>
			</button>
			<button type="button" aria-label={copy.previous} title={copy.previous} on:click={() => go(-1)}
				><img
					src="https://www.copaair.com/webassets/icons/regular/white/chevron_l.svg"
					alt=""
					width="20"
					height="20"
				/><span class="contrast-arrow" aria-hidden="true">‹</span></button
			>
			<span class="counter" aria-hidden="true"
				>{number(selected + 1)} / {number(item.slides.length)}</span
			>
			<button type="button" aria-label={copy.next} title={copy.next} on:click={() => go(1)}
				><img
					src="https://www.copaair.com/webassets/icons/regular/white/chevron_r.svg"
					alt=""
					width="20"
					height="20"
				/><span class="contrast-arrow" aria-hidden="true">›</span></button
			>
		</div>
	{/if}
	<div
		class="viewport"
		use:emblaCarouselSvelte={{
			// Embla's duration tunes its spring physics; it is not milliseconds.
			options: { loop: true, watchDrag: !reduceMotion, duration: reduceMotion ? 0 : 40 },
			plugins: []
		}}
		on:emblaInit={init}
	>
		<div class="slides">
			{#each item.slides as slide, index (slide.id)}
				<div
					class="slide"
					role="group"
					aria-roledescription={copy.slide}
					aria-label={`${index + 1} ${copy.of} ${item.slides.length}`}
					aria-hidden={selected !== index ? true : undefined}
					inert={selected !== index}
				>
					<HeroSlide
						carousel={true}
						item={slide}
						heading={index === 0 ? item.heading : 'h2'}
						eager={index === 0 && item.heading === 'h1'}
					/>
				</div>
			{/each}
		</div>
	</div>
	<p class="sr-only" aria-live={playing ? 'off' : 'polite'} aria-atomic="true">
		{selected + 1}
		{copy.of}
		{item.slides.length}: {item.slides[selected]?.title}
	</p>
</section>

<style>
	.hero-carousel {
		position: relative;
		min-width: 0;
		font-family: "Suisse Int'l", sans-serif;
	}
	.viewport {
		overflow: hidden;
	}
	.slides {
		display: flex;
		touch-action: pan-y pinch-zoom;
	}
	.slide {
		flex: 0 0 100%;
		min-width: 0;
	}
	.controls {
		position: absolute;
		z-index: 1;
		right: 16px;
		display: flex;
		align-items: center;
		padding: 4px;
		border: 1px solid #ffffff24;
		border-radius: 28px;
		background: rgb(0 27 64 / 62%);
		color: white;
		backdrop-filter: blur(12px);
		-webkit-backdrop-filter: blur(12px);
		box-shadow: 0 2px 10px #001b4010;
		visibility: hidden;
	}
	.controls.positioned {
		visibility: visible;
	}
	button {
		display: grid;
		place-items: center;
		position: relative;
		width: 44px;
		height: 44px;
		min-width: 44px;
		padding: 0;
		border: 0;
		border-radius: 50%;
		background: transparent;
		color: inherit;
		cursor: pointer;
	}
	button:hover {
		background: #ffffff20;
	}
	button:focus-visible {
		outline: 2px solid white;
		outline-offset: -4px;
		background: #001b40;
	}
	.counter {
		min-width: 52px;
		padding: 0 6px;
		text-align: center;
		font-size: 12px;
		line-height: 16px;
		font-variant-numeric: tabular-nums;
	}
	.progress-ring {
		position: absolute;
		inset: 2px;
		transform: rotate(-90deg);
		fill: none;
		stroke-width: 1.5;
		pointer-events: none;
	}
	.ring-track {
		stroke: #ffffff40;
	}
	.ring-value {
		stroke: currentColor;
		stroke-linecap: round;
	}
	.contrast-arrow {
		display: none;
	}
	@media (min-width: 600px) {
		.controls {
			right: calc((100% - 560px) / 2);
		}
	}
	@media (min-width: 960px) {
		.hero-carousel :global(.hero-copy) {
			grid-row: 1 / span 3;
			align-self: end;
			margin-bottom: 28px;
			/* Reserve room for the controls and a gap when desktop copy wraps. */
			max-width: min(42rem, calc(100% - 224px));
		}
		.controls {
			right: 72px;
		}
	}
	@media (min-width: 1367px) {
		.controls {
			right: calc((100% - 1224px) / 2);
		}
	}
	@media (prefers-reduced-transparency: reduce) {
		.controls {
			background: #001b40;
			backdrop-filter: none;
		}
	}
	@media (forced-colors: active) {
		.controls {
			background: Canvas;
			border-color: ButtonText;
			color: ButtonText;
		}
		button {
			border: 1px solid ButtonText;
		}
		button:focus-visible {
			outline-color: Highlight;
		}
		button img {
			display: none;
		}
		.contrast-arrow {
			display: inline;
		}
	}
</style>
