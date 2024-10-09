<script lang="ts">
	import { getDirectusImage } from '$lib/components/directus/stopover/utils';
	import { getTypographyVariant } from '$lib/components/ui/foundations/typography';
	import { TextContentDescription } from '$lib/components/site/text-content/description';
	import type { TextContentSchema } from '$lib/directus/text-content';
	import { TextContentCallToActions } from '$lib/components/site/text-content/call-to-actions';

	export let item: TextContentSchema;

	const {
		image,
		translations: {
			0: { title, description, media, call_to_actions }
		}
	} = item;

	const mainImage = media || image;
</script>

<div class="container-grid grid bg-backgound-paper">
	<div
		class="col-start-2 row-start-1 my-8 self-start overflow-hidden rounded-2xl"
		style="background-color:var(--section-color);"
	>
		<div class="px-4 py-6">
			{#if title}
				<h2 class={getTypographyVariant('h2', 'mb-2 text-grey-50')}>{title}</h2>
			{/if}
			<TextContentDescription {description} theme="dark" />
			<TextContentCallToActions {call_to_actions} theme="dark" />
		</div>
		{#if mainImage}
			<picture>
				<img src="{getDirectusImage(mainImage)}&key=2-1x600" alt="" class="h-auto w-full" />
			</picture>
		{/if}
	</div>
</div>
