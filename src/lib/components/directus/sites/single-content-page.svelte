<script lang="ts">
	import type { PageSchema } from '$lib/directus/page';
	import type { TextContentSchema } from '$lib/directus/text-content';
	import { filter, propEq } from 'ramda';
	import { cn } from '$lib/utils';
	import { Button } from '$ui/components/button';
	import { getTypography, Heading } from '$ui/components/typography';

	export let layout: PageSchema;
	export let locale: string;
	export let single_content: TextContentSchema;

	const layoutTranslation = filter(propEq(locale, 'languages_code'), layout.translations)[0];

	const {
		translations: {
			0: { title, description, call_to_actions }
		}
	} = single_content;
</script>

<svelte:head>
	<title>{layoutTranslation.title_tag}</title>
</svelte:head>

<div class="bg-primary pb-petit pt-40">
	<div class="container mx-auto">
		<Heading tag='h1' class='text-grey-50'>
			{title}
		</Heading>
	</div>
</div>
<div class="my-roomy container mx-auto">
	<div class={getTypography('body-large', 'body')}>
		{@html description}
	</div>
	<div class="mt-petit flex gap-2">
		{#if call_to_actions}
			{#each call_to_actions as cta, i}
				{@const { text, link, open_in } = cta}
				<Button
					href={link}
					target={open_in}
					variant={i === 0 ? undefined : 'outline-primary-main'}
				>
					{text}
				</Button>
			{/each}
		{/if}
	</div>
</div>
