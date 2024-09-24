<script lang="ts">
	import { getDirectusImage } from '$lib/components/directus/stopover/utils';
	import { getTypographyVariant } from '$lib/components/ui/foundations/typography';
	import { cn } from '$lib/utils';

	export let main_image: string;
	export let name: string;
</script>

<div class="container-grid">
	<picture class="col-span-full row-start-1">
		<img
			src="{getDirectusImage(main_image)}&key=stopover-item-sm"
			alt={name}
			class="m-auto w-full"
		/>
	</picture>
	<div class="col-span-full row-start-1 bg-gradient-to-t from-black to-transparent to-50%"></div>
	<h1
		class={cn(
			getTypographyVariant('display-big'),
			'col-start-2 row-start-1 mb-8 self-end text-grey-50 mix-blend-screen'
		)}
	>
		{name}
	</h1>
</div>
