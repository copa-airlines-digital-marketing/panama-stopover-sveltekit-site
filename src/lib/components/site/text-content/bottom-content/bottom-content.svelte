<script lang="ts">
	import { getDirectusImage } from '$lib/components/directus/stopover/utils';
	import { TextContentDescription } from '$lib/components/site/text-content/description';
	import type { TextContentSchema } from '$lib/directus/text-content';
	import { TextContentCallToActions } from '$lib/components/site/text-content/call-to-actions';
	import { Heading } from '$ui/components/typography';

	export let item: TextContentSchema;

	const {
		image,
		translations: {
			0: { title, description, media, call_to_actions }
		}
	} = item;

	const mainImage = media || image;
</script>

<div class="container-grid bg-background-paper grid">
	<div
		class="col-start-2 row-start-1 my-8 self-start overflow-hidden rounded-2xl md:flex md:flex-row-reverse"
		style="background-color:var(--section-color);"
	>
		<div class="px-4 py-6 md:flex md:flex-col md:justify-center md:px-8 md:py-8">
			{#if title}
				<Heading class='text-grey-50 mb-2 mt-0'>
					{title}
				</Heading>
			{/if}
			<TextContentDescription {description} theme="dark" />
			<TextContentCallToActions {call_to_actions} theme="dark" />
		</div>
		{#if mainImage}
			<picture class="md:shrink-0">
				<img
					src="{getDirectusImage(mainImage)}?key=2-1x600"
					alt=""
					class="h-auto w-full"
					loading="lazy"
				/>
			</picture>
		{/if}
	</div>
</div>
