<script lang="ts">
	import { page } from '$app/stores';
	import { getDirectusImage } from '$lib/components/directus/stopover/utils';
	import { getTypographyVariant } from '$lib/components/ui/foundations/typography';
	import { mediaQueryMD } from '$lib/constants';
	import type { TextContentSchema } from '$lib/directus/text-content';
	import { Breadcrum } from '../../navigation/breadcrum';
	import { TextContentCallToActions } from '../call-to-actions';

	export let item: TextContentSchema;

	const {
		image,
		translations: {
			0: { title, media, call_to_actions }
		}
	} = item;

	const pageSettings = $page.data.page;

	const mainImage = media || image;
</script>

<div class="container-grid grid-rows-[112px_auto_auto_1fr]">
	{#if mainImage}
		<div
			class="col-span-full col-start-1 row-span-4 row-start-1 pt-20 md:self-end md:justify-self-end md:pt-0"
		>
			<picture>
				<source srcset="{getDirectusImage(mainImage)}?width=700" media={mediaQueryMD} />
				<img src="{getDirectusImage(mainImage)}?width=600" alt="" class="h-auto w-full" />
			</picture>
		</div>
	{/if}
	<div class="row-start-1 h-28"></div>
	{#if pageSettings}
		<div class="col-start-2 row-start-2">
			<Breadcrum item={pageSettings} variant="invert"></Breadcrum>
		</div>
	{/if}
	<h1 class={getTypographyVariant('display-big', 'col-start-2 row-start-3 text-grey-50')}>
		{title}
	</h1>
	<div class="col-start-2 row-start-4 mb-4 self-end *:grow-0 md:self-start">
		<TextContentCallToActions {call_to_actions} stretch={false} />
	</div>
</div>
