<script>
	import { getTypographySize } from '$lib/components/ui/typography';
</script>

<span
	class={getTypographySize(
		'caption-tiny',
		'col-start-3 row-span-2 ml-4 hidden text-primary sm:block'
	)}
>
	<slot />
</span>
