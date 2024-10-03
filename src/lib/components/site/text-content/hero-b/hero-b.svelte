<script lang="ts">
	import type { TextContentSchema } from '$lib/directus/text-content';
	import { page } from '$app/stores';
	import { getTypography } from '$lib/components/ui/foundations/typography';
	import { Breadcrum } from '../../navigation/breadcrum';
	import { getTypographyVariant } from '$lib/components/ui/foundations/typography';
	import { getDirectusImage } from '$lib/components/directus/stopover/utils';
	import { SVG } from '$lib/components/ui/foundations/icon';
	import { Button } from '$lib/components/ui/foundations/button';
	import { nth } from 'ramda';

	export let item: TextContentSchema;

	const {
		image,
		translations: {
			0: { title, description, media, icon, call_to_actions }
		}
	} = item;

	const pageSettings = $page.data.page;

	const mainImage = media || image;

	const classToChild = (value: string, selector: string) =>
		value
			.split(' ')
			.map((v) => selector + v)
			.join(' ');
</script>

<div class="container-grid auto-rows-auto">
	<div class="row-start-1 h-28"></div>
	{#if pageSettings}
		<div class="col-start-2 row-start-2">
			<Breadcrum item={pageSettings} variant="invert"></Breadcrum>
		</div>
	{/if}
	<h1 class={getTypographyVariant('display-big', 'col-start-2 row-start-3 mb-6 text-grey-50')}>
		{title}
	</h1>
	<div class="col-span-full col-start-1 row-span-3 row-start-5 bg-backgound-paper"></div>
	s
	{#if mainImage}
		<div class="col-start-2 row-span-2 row-start-4">
			<picture>
				<img
					src="{getDirectusImage(mainImage)}&key=3-4x600"
					alt=""
					class="h-auto w-full rounded-2xl shadow-lg"
				/>
			</picture>
		</div>
	{/if}
	{#if icon}
		<SVG data={icon.code} class="col-start-2 row-span-2 row-start-4 size-28 fill-black py-2"></SVG>
	{/if}
	{#if description}
		<div
			class={getTypography(
				'body',
				'body',
				`col-start-2 row-start-6 mb-spacious mt-6 [&_a]:text-primary-light [&_a]:hover:underline [&_h2]:mt-8 [&_h2]:text-u2 [&_h2]:font-bold [&_h2]:text-primary-dark [&_h3]:mt-6 [&_h3]:text-u1 [&_h3]:font-bold [&_h3]:text-grey-700 [&_p]:my-2 [&_ul]:list-disc [&_ul]:pl-3`
			)}
		>
			{@html description}
		</div>
	{/if}
	{#if call_to_actions}
		<ul class="col-start-2 row-start-7 mt-6 flex gap-2">
			<li class="flex-grow">
				{#each call_to_actions as cta, i}
					<Button
						href={cta.link}
						target={cta.open_in}
						variant={i > 0 ? 'outline-primary-main' : 'solid-primary-main'}
					>
						{cta.text}
					</Button>
				{/each}
			</li>
		</ul>
	{/if}
</div>
