<script lang="ts">
	import { getDirectusImage } from '$lib/components/directus/stopover/utils';
	import { Button } from '$ui/components/button';
	import type { TextContentSchema } from '$lib/directus/text-content';
	import Description from '../description/description.svelte';
	import { Heading } from '$ui/components/typography';

	export let item: TextContentSchema;

	const {
		image,
		translations: {
			0: { media, title, description, call_to_actions }
		}
	} = item;

	const mainImage = image || media;
</script>

{#if mainImage}
	<picture>
		<img
			src="{getDirectusImage(mainImage)}?key=4-1x600"
			alt=""
			class="mb-6 h-auto w-full"
			loading="lazy"
		/>
	</picture>
{/if}
{#if title}
	<Heading class='mt-6 mb-4 max-w-full'>
		{title}
	</Heading>
{/if}
<Description {description} />
{#if call_to_actions}
	<ul class="mt-6 flex gap-2">
		<li class="grow">
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
