<script lang="ts">
	import { getDirectusImage } from '$lib/components/directus/stopover/utils';
	import { Button } from '$lib/components/ui/foundations/button';
	import { getTypographyVariant } from '$lib/components/ui/foundations/typography';
	import type { TextContentSchema } from '$lib/directus/text-content';

	export let item: TextContentSchema;

	const {
		translations: {
			0: { title, description, media, call_to_actions }
		}
	} = item;

	const ctas = call_to_actions || [];
</script>

<div class="container-grid grid-rows-[2fr_64px_auto]">
	<div class="col-span-full col-start-1 row-span-2 row-start-1">
		<picture>
			{#if media}
				<img src="{getDirectusImage(media)}&key=square-600" alt="" class="h-auto w-full" />
			{/if}
		</picture>
	</div>
	<div
		class="col-span-1 col-start-2 row-span-2 row-start-2 space-y-5 rounded-2xl bg-primary p-4 shadow-lg"
	>
		<h1 class={getTypographyVariant('display-big', 'text-grey-50')}>{title}</h1>
		<div class="text-grey-50">
			{@html description}
		</div>
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
