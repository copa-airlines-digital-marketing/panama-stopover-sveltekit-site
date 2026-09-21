<script lang="ts">
	import type { HeroBlock } from '$lib/directus/hero';
	import { page } from '$app/stores';
	import { Breadcrum } from '$lib/components/site/navigation/breadcrum';
	import { Heading } from '$ui/components/typography';
	import { Button } from '$ui/components/button';
	export let item: HeroBlock;
	export let accent: string | undefined = undefined;
	$: slide = item.slides[0];
	$: asset = `https://cm-marketing.directus.app/assets/${slide.image}`;
</script>

<div
	class="hero-pillar container-grid grid-rows-[112px_auto_auto_1fr]"
	style:background-color={accent || 'var(--color-primary-main, #0033A2)'}
>
	<div
		class="col-span-full col-start-1 row-span-4 row-start-1 pt-20 md:self-end md:justify-self-end md:pt-0"
	>
		<picture>
			<source srcset="{asset}?width=700" media="(min-width: 768px)" />
			<img
				src="{asset}?width=600"
				alt={slide.alt}
				class="h-auto w-full"
				loading={item.heading === 'h1' ? 'eager' : 'lazy'}
				fetchpriority={item.heading === 'h1' ? 'high' : 'auto'}
			/>
		</picture>
	</div>
	<div class="row-start-1 h-28"></div>
	{#if item.heading === 'h1' && $page.data.page}
		<div class="col-start-2 row-start-2"><Breadcrum item={$page.data.page} variant="invert" /></div>
	{/if}
	<div class="col-start-2 row-start-3 min-w-0">
		{#if slide.eyebrow}<p class="mb-3 text-white">{slide.eyebrow}</p>{/if}
		<Heading tag={item.heading} variant="display-big" class="text-grey-50">{slide.title}</Heading>
	</div>
	<div class="col-start-2 row-start-4 mb-4 self-end md:self-start">
		{#if slide.ctas.length}
			<ul class="mt-6 flex gap-2">
				<li>
					{#each slide.ctas as cta, index}
						<Button
							href={cta.link}
							target={cta.open_in}
							rel={cta.open_in === '_blank' ? 'noopener noreferrer' : undefined}
							variant={index === 0 ? 'solid-primary-main' : 'outline-primary-main'}
							>{cta.text}</Button
						>
					{/each}
				</li>
			</ul>
		{/if}
	</div>
</div>
