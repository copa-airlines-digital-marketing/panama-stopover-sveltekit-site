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
	import { page } from '$app/stores';
	import { goto } from '$app/navigation';
	import { browser } from '$app/environment';

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

	// Each tabs section uses its own query param key so multiple tab blocks
	// on the same page don't collide: ?tab_<section_id>=<index>
	const paramKey = `tab_${section_id ?? id}`;

	function makeTabValue(index: number) {
		return [section_id, id, index].join('-');
	}

	function getInitialValue(): string {
		if (!browser) return makeTabValue(0);
		const raw = $page.url.searchParams.get(paramKey);
		const idx = raw !== null ? parseInt(raw, 10) : NaN;
		const tabCount = section_content?.length ?? 0;
		if (!Number.isNaN(idx) && idx >= 0 && idx < tabCount) {
			return makeTabValue(idx);
		}
		return makeTabValue(0);
	}

	let value = getInitialValue();

	function onTabChange(newValue: string) {
		value = newValue;
		// Derive the index back from the composite value so we store a simple number.
		const parts = newValue.split('-');
		const idx = parseInt(parts[parts.length - 1], 10);
		const url = new URL($page.url);
		url.searchParams.set(paramKey, String(idx));
		goto(url.toString(), { replaceState: true, keepFocus: true, noScroll: true });
	}

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
			<Tabs.Root class="col-span-full mb-normal" bind:value onValueChange={onTabChange}>
				<Tabs.List class="flex flex-wrap content-start justify-around gap-2">
					{#each $tabNames as tabName, i}
						<Tabs.Trigger
							value={[section_id, id, i].join('-')}
							class={cn(
								buttonVariants({ size: 'default', variant: 'transparent-primary-main' }),
								'relative grow rounded-none  py-2 focus:outline-0 active:outline-0 data-[state="active"]:bg-background-lightblue'
							)}
						>
							{tabName}
							{#if value === [section_id, id, i].join('-')}
								<div
									in:send={{ key: 'trigger' }}
									out:receive={{ key: 'trigger' }}
									class="absolute bottom-1 h-0.5 w-3/4 rounded-full bg-secondary"
								></div>
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
