<script lang="ts">
	import { getDirectusImage } from '$lib/components/directus/stopover/utils';
	import { cn } from '$lib/utils';
	import ItemGallery from '$lib/components/site/items/carousel/carousel.svelte';
	import { cubicInOut } from 'svelte/easing';
	import { crossfade } from 'svelte/transition';
	import { mediaQueryLG, mediaQueryMD } from '$lib/constants';
	import { getTypographyVariant } from '$ui/components/typography';

	let className: string | null | undefined = undefined;
	export { className as class };
	export let galleryImages: string[];
  export let main_image: string;
  export let name: string 

	let selectedImage = 0;

	function changeSelectionElswere(event: CustomEvent) {
		selectedImage = event.detail;
	}

	const changeSelection = (index: number) => () => {
		selectedImage = index;
	};

	const [send, receive] = crossfade({
		duration: 250,
		easing: cubicInOut
	});
</script>

<div class="container-grid">
	<div class="col-span-full row-span-3 row-start-1 overflow-hidden">
		<ItemGallery
			let:Slide
			class="flex"
			bind:selected={selectedImage}
			on:select={changeSelectionElswere}
		>
			{#each [main_image].concat(galleryImages) as img}
				<Slide class="shrink-0 grow-0 basis-full">
					<picture>
						<source srcset="{getDirectusImage(img)}?key=3-1x1920" media={mediaQueryLG} />
						<source srcset="{getDirectusImage(img)}?key=3-1x1368" media={mediaQueryMD} />

						<img
							src="{getDirectusImage(img)}?key=stopover-item-sm"
							alt={name}
							class="h-auto w-full"
						/>
					</picture>
				</Slide>
			{:else}
				<Slide>No Images in gallery</Slide>
			{/each}
		</ItemGallery>
	</div>
	<div
		class="relative col-span-full row-span-2 row-start-2 bg-linear-to-t from-black to-transparent"
	></div>
	<div class="relative col-start-2 row-start-2">
		<slot />
	</div>
	<h1
		class={cn(
			getTypographyVariant('display'),
			'col-start-2 row-start-3 mb-8 self-end text-grey-50 mix-blend-screen'
		)}
	>
		{name}
	</h1>
</div>
<div class="my-3 md:container md:mx-auto">
	<ItemGallery
		bind:selected={selectedImage}
		let:Slide
		class="mx-4 flex gap-2 md:mx-0"
		options={{ containScroll: 'keepSnaps', dragFree: true }}
		on:select={changeSelectionElswere}
	>
		{#each [main_image].concat(galleryImages) as img, i}
			<Slide class="shrink-0 grow-0 basis-16">
				<button
					type="button"
					class="relative"
					on:click={changeSelection(i)}
					disabled={selectedImage === i}
				>
					<picture>
						<img
							src="{getDirectusImage(img)}?key=stopover-item-thumbnail-sm"
							alt={name}
							class="h-auto w-full rounded-sm"
						/>
					</picture>
					{#if selectedImage === i}
						<div
							in:send={{ key: 'trigger' }}
							out:receive={{ key: 'trigger' }}
							class={cn('absolute inset-0 rounded-sm mix-blend-color', className)}
						></div>
					{/if}
				</button>
			</Slide>
		{:else}
			<Slide>No Images in gallery</Slide>
		{/each}
	</ItemGallery>
</div>
