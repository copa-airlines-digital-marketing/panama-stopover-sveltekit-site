<script lang="ts">
	import type { SectionSchema } from '$lib/directus/section';
	import { cn } from '$lib/utils';
	import { isNotNil, isEmpty } from 'ramda';
	import { containerVariant, sectionVariants } from '../../sites';
	import { landmarkToTag } from '../../utils';
	import { PlainSectionCotent } from '../..';
	import { Tabs } from 'bits-ui';
	import { setTabContext } from './context';
	import { buttonVariants } from '$ui/components/button';
	import { crossfade } from 'svelte/transition';
	import { cubicInOut } from 'svelte/easing';

	export let section: SectionSchema;

	const {
		id,
		section_id,
		landmark,
		background_color,
		vertical_spacing,
		horizontal_behaviour,
		content_spacing,
		content_horizontal_alignment,
		content_horizontal_distribution,
		content_vertical_alignment,
		content_vertical_distribution,
		section_content
	} = section;

	const variantObject = {
		vertical_spacing,
		content_spacing,
		content_horizontal_alignment,
		content_horizontal_distribution,
		content_vertical_alignment,
		content_vertical_distribution
	};

	let tabNames = setTabContext();

	let value = [section_id, id, 0].join('-');

	const [send, receive] = crossfade({
		duration: 250,
		easing: cubicInOut
	});
</script>

<svelte:element
	this={landmarkToTag(landmark)}
	id={section_id || undefined}
	class={cn(containerVariant({ horizontal_behaviour }), '')}
	style="--section-color:{background_color || 'transparent'};background-color:{background_color ||
		'transparent'};"
>
	{#if isNotNil(section_content) && !isEmpty(section_content)}
		<div
			class={cn(sectionVariants(variantObject), 'relative')}
			class:col-start-2={horizontal_behaviour === 'container-grid'}
		>
			<Tabs.Root class="mb-normal col-span-full" bind:value>
				<Tabs.List class="flex content-start justify-around gap-2">
					{#each $tabNames as tabName, i}
						<Tabs.Trigger
							value={[section_id, id, i].join('-')}
							class={cn(
								buttonVariants({ size: 'default', variant: 'transparent-primary-main' }),
								'relative w-full rounded-none py-2 focus:outline-0 active:outline-0'
							)}
						>
							{tabName}
							{#if value === [section_id, id, i].join('-')}
								<div
									in:send={{ key: 'trigger' }}
									out:receive={{ key: 'trigger' }}
									class="bg-secondary absolute bottom-1 h-0.5 w-3/4 rounded-full"
								/>
							{/if}
						</Tabs.Trigger>
					{/each}
				</Tabs.List>
				{#each section_content as item, i}
					<Tabs.Content value={[section_id, id, i].join('-')}>
						<PlainSectionCotent section_content={item} />
					</Tabs.Content>
				{/each}
			</Tabs.Root>
		</div>
	{:else}
		{console.warn('no content for section: ' + id)}
	{/if}
</svelte:element>
