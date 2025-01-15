<script lang="ts">
	import { getDirectusImage } from '$lib/components/directus/stopover/utils';
	import { Button } from '$lib/components/ui/foundations/button';
	import { getTypographyVariant } from '$lib/components/ui/foundations/typography';
	import { Breadcrum } from '$lib/components/site/navigation/breadcrum';
	import { page } from '$app/stores';
	import type { TextContentSchema } from '$lib/directus/text-content';
	import { SVG } from '$lib/components/ui/foundations/icon';
	import { mediaQueryLG, mediaQueryMD } from '$lib/constants';

	export let item: TextContentSchema;

	const {
		image,
		translations: {
			0: { title, description, media, icon, call_to_actions }
		}
	} = item;

	const ctas = call_to_actions || [];

	const pageSettings = $page.data.page;

	const mainImage = media || image;
</script>

<div class="container-grid auto-rows-auto">
	<div class="col-span-full row-start-1 h-28"></div>
	<div class="col-span-full col-start-1 row-span-3 row-start-1">
		{#if mainImage}
			<picture>
				<source srcset="{getDirectusImage(mainImage)}?key=3-1x1920" media={mediaQueryLG} />
				<source srcset="{getDirectusImage(mainImage)}?key=3-1x1368" media={mediaQueryMD} />
				<img src="{getDirectusImage(mainImage)}?key=square-600" alt="" class="h-auto w-full" />
			</picture>
		{/if}
	</div>
	{#if icon}
		<div
			class="col-start-2 row-start-2 size-32 md:justify-self-end"
			style="background-image: radial-gradient(var(--theme-contrast), transparent 75%);"
		>
			<SVG data={icon.code} class="w-full" style="fill:var(--theme)" />
		</div>
	{/if}
	<div
		class="col-span-1 col-start-2 row-span-2 row-start-3 my-8 space-y-5 rounded-2xl bg-primary p-4 shadow-lg md:row-span-2 md:row-start-2 md:self-center md:justify-self-start md:p-6"
	>
		<h1 class={getTypographyVariant('display', 'text-grey-50')}>{title}</h1>
		{#if description}
			<div class="text-grey-50 md:max-w-prose">
				{@html description}
			</div>
		{/if}
		{#if call_to_actions}
			<ul class="flex gap-2">
				{#each ctas as cta}
					<li>
						<Button class="bg-secondary" href={cta.link} target={cta.open_in}>{cta.text}</Button>
					</li>
				{/each}
			</ul>
		{/if}
	</div>
</div>
{#if pageSettings}
	<div class="container mx-auto">
		<Breadcrum item={pageSettings}></Breadcrum>
	</div>
{/if}
