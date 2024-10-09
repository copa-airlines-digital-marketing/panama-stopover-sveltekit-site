<script lang="ts">
	import { getDirectusImage } from '$lib/components/directus/stopover/utils';
	import { PillardCard } from '$lib/components/ui/patterns/cards/pillard';
	import type { TextContentSchema } from '$lib/directus/text-content';

	export let item: TextContentSchema;

	const {
		image,
		translations: {
			0: { title, media, call_to_actions }
		}
	} = item;

	const firstCallToAction = call_to_actions?.[0];

	const mainImage = media || image;
</script>

<PillardCard
	href={firstCallToAction?.link}
	target={firstCallToAction?.open_in}
	let:CallToActions
	let:Image
	let:Title
>
	{#if mainImage}
		<Image>
			<img src="{getDirectusImage(mainImage)}&key=square-600" class="h-auto w-full" alt="" />
		</Image>
	{/if}
	<Title>
		{title}
	</Title>
	<CallToActions>
		{firstCallToAction?.text}
	</CallToActions>
</PillardCard>
