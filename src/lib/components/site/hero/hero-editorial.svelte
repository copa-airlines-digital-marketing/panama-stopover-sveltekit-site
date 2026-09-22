<script lang="ts">
	import type { HeroBlock } from '$lib/directus/hero';
	import { page } from '$app/stores';
	import { Breadcrum } from '$lib/components/site/navigation/breadcrum';
	import { Heading } from '$ui/components/typography';
	import { Button } from '$ui/components/button';
	import HeroSeal from './hero-seal.svelte';
	export let item: HeroBlock;
	export let accent: string | undefined = undefined;
	$: slide = item.slides[0];
	$: split = item.variant === 'hero-c';
	$: asset = `https://cm-marketing.directus.app/assets/${slide.image}`;
</script>

<div
	class="editorial-hero container-grid"
	class:split
	style:background-color={accent || 'var(--color-primary-main, #0033A2)'}
>
	<div class="heading-area">
		{#if item.heading === 'h1' && $page.data.page}
			<Breadcrum item={$page.data.page} variant="invert" />
		{/if}
		{#if slide.eyebrow}<p class="mb-3 text-white">{slide.eyebrow}</p>{/if}
		<Heading
			tag={item.heading}
			variant={split ? 'display-big' : 'display'}
			class="mb-6 text-grey-50">{slide.title}</Heading
		>
	</div>
	<div class="photo">
		<picture>
			<source
				srcset={split ? `${asset}?width=700` : `${asset}?key=3-1x1368`}
				media="(min-width: 768px)"
			/>
			<img
				src={split ? `${asset}?width=600` : `${asset}?key=4-3x600`}
				alt={slide.alt}
				loading={item.heading === 'h1' ? 'eager' : 'lazy'}
				fetchpriority={item.heading === 'h1' ? 'high' : 'auto'}
			/>
		</picture>
		{#if !split && slide.icon}
			<div class="hero-seal"><HeroSeal src={slide.icon} /></div>
		{/if}
	</div>
	{#if !split}<div class="paper"></div>{/if}
	<div class="body-area">
		{#if slide.descriptionHtml}
			<div class="description">
				<!-- eslint-disable-next-line svelte/no-at-html-tags -- Server allowlists formatting without active markup. -->
				{@html slide.descriptionHtml}
			</div>
		{/if}
		{#if slide.ctas.length}
			<ul class="my-6 flex flex-wrap gap-3">
				{#each slide.ctas as cta, i}
					<li>
						<Button
							href={cta.link}
							target={cta.open_in}
							rel={cta.open_in === '_blank' ? 'noopener noreferrer' : undefined}
							variant={split
								? 'outline-invert'
								: i === 0
									? 'solid-primary-main'
									: 'outline-primary-main'}>{cta.text}</Button
						>
					</li>
				{/each}
			</ul>
		{/if}
	</div>
</div>

<style>
	.editorial-hero {
		background: var(--color-primary-main, #0032a0);
		grid-template-rows: 112px auto auto auto;
		isolation: isolate;
	}
	.heading-area {
		grid-column: 2;
		grid-row: 2;
		min-width: 0;
		z-index: 1;
		overflow-wrap: anywhere;
	}
	.photo {
		grid-column: 2;
		grid-row: 3;
		position: relative;
		min-width: 0;
		z-index: 1;
	}
	.photo picture > img {
		display: block;
		width: 100%;
		height: auto;
		border-radius: 1rem;
		box-shadow: 0 8px 16px #00163c26;
		aspect-ratio: 4 / 3;
		object-fit: cover;
	}
	.photo .hero-seal {
		position: absolute;
		left: 1rem;
		top: 1rem;
		width: 6rem;
		height: 6rem;
	}
	.paper {
		grid-column: 1 / -1;
		grid-row: 3 / 5;
		background: var(--color-background-paper, #fff);
		margin-top: 3rem;
	}
	.body-area {
		grid-column: 2;
		grid-row: 4;
		z-index: 1;
		min-width: 0;
		padding: 1.5rem 0 2.5rem;
	}
	.description {
		font-family: "Suisse Int'l", sans-serif;
		line-height: 1.6;
		color: #333;
	}
	.description :global(p + p) {
		margin-top: 1rem;
	}
	.description :global(ul) {
		list-style: disc;
		padding-left: 1.5rem;
	}
	.description :global(ol) {
		list-style: decimal;
		padding-left: 1.5rem;
	}
	.split .photo {
		grid-column: 1 / -1;
		grid-row: 1 / 5;
		align-self: start;
		padding-top: 5rem;
		z-index: 0;
	}
	.split .photo picture > img {
		aspect-ratio: auto;
		border-radius: 0;
		box-shadow: none;
	}
	.split .body-area {
		grid-row: 3;
	}
	.split .description {
		color: white;
	}
	@media (min-width: 768px) {
		.photo picture > img {
			aspect-ratio: 3;
		}
		.split {
			min-height: 420px;
		}
		.split .photo {
			justify-self: end;
			align-self: end;
			padding-top: 0;
			max-width: 700px;
		}
		.split .heading-area,
		.split .body-area {
			max-width: 65%;
		}
	}
</style>
