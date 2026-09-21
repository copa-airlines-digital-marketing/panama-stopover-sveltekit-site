<script lang="ts">
	import type { HeroSlide } from '$lib/directus/hero';
	import { Heading } from '$ui/components/typography';
	import { Button } from '$ui/components/button';
	import HeroSeal from './hero-seal.svelte';
	export let item: HeroSlide;
	export let heading: 'h1' | 'h2' = 'h2';
	export let eager = false;
	export let carousel = false;
	let failed = false;
	$: if (item.image) failed = false;
	$: asset = `https://cm-marketing.directus.app/assets/${item.image}`;
</script>

<div class="hero-slide container-grid auto-rows-auto" class:carousel>
	<div class="col-span-full row-start-1 h-28"></div>
	<div class="hero-photo col-span-full col-start-1 row-span-3 row-start-1">
		<picture>
			<source srcset="{asset}?key=3-1x1920" media="(min-width: 1024px)" />
			<source srcset="{asset}?key=3-1x1368" media="(min-width: 768px)" />
			<img
				src="{asset}?key=square-600"
				alt={item.alt}
				width="1920"
				height="640"
				loading={eager ? 'eager' : 'lazy'}
				fetchpriority={eager ? 'high' : 'auto'}
				on:error={() => (failed = true)}
				class:failed
			/>
		</picture>
	</div>
	{#if item.icon}
		<div class="hero-seal col-start-2 row-start-2 size-32 md:justify-self-end">
			<HeroSeal src={item.icon} />
		</div>
	{/if}
	<div
		class="hero-copy col-span-1 col-start-2 row-span-2 row-start-3 my-8 space-y-5 rounded-2xl bg-primary p-4 shadow-lg md:row-start-2 md:self-center md:justify-self-start md:p-6"
	>
		{#if item.eyebrow}<p class="hero-eyebrow">{item.eyebrow}</p>{/if}
		<Heading tag={heading} variant="display" class="hero-title text-grey-50">{item.title}</Heading>
		{#if item.descriptionHtml}<div
				class={`hero-description text-grey-50 ${carousel ? '' : 'md:max-w-prose'}`}
			>
				<!-- eslint-disable-next-line svelte/no-at-html-tags -- The server allowlists formatting tags with sanitize-html; attributes and active content are removed. -->
				{@html item.descriptionHtml}
			</div>{/if}
		{#if item.ctas.length}
			<ul class="flex flex-wrap gap-3">
				{#each item.ctas as cta, index}
					<li>
						<Button
							variant="outline-invert"
							class={index === 0
								? 'bg-white text-primary hover:bg-grey-100 hover:text-primary focus:bg-grey-100 focus:text-primary'
								: 'border border-white bg-transparent text-white'}
							href={cta.link}
							target={cta.open_in}
							rel={cta.open_in === '_blank' ? 'noopener noreferrer' : undefined}>{cta.text}</Button
						>
					</li>
				{/each}
			</ul>
		{/if}
	</div>
</div>

<style>
	.hero-slide {
		height: 100%;
	}
	.hero-slide.carousel {
		font-family: "Suisse Int'l", sans-serif;
	}
	.hero-photo {
		background: #eff5ff;
		min-height: 20rem;
	}
	.hero-photo img {
		width: 100%;
		height: 100%;
		object-fit: cover;
		aspect-ratio: 1;
	}
	.hero-photo img.failed {
		visibility: hidden;
	}
	.hero-copy {
		overflow-wrap: anywhere;
	}
	.carousel .hero-copy {
		max-width: min(100%, 42rem);
	}
	.hero-slide:not(.carousel) .hero-photo img {
		height: auto;
	}
	.carousel .hero-copy :global(.hero-title) {
		font-family: Gilroy, sans-serif;
	}
	.carousel .hero-copy :global(.hero-title) {
		margin: 0;
	}
	.hero-eyebrow {
		color: white;
		font-size: 1rem;
		line-height: 1.5;
	}
	.carousel .hero-description {
		font-size: 1rem;
		line-height: 1.5;
	}
	.hero-description :global(p + p) {
		margin-top: 1rem;
	}
	.hero-description :global(ul) {
		list-style: disc;
		padding-left: 1.5rem;
	}
	.hero-description :global(ol) {
		list-style: decimal;
		padding-left: 1.5rem;
	}
	.hero-copy :global(a:focus-visible) {
		outline: 3px solid white;
		outline-offset: 4px;
	}
	.hero-copy :global(a) {
		font-family: "Suisse Int'l", sans-serif;
	}
	@media (min-width: 768px) {
		.hero-photo img {
			aspect-ratio: 3;
		}
	}
</style>
