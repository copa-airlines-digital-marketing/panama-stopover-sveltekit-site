<script>
	import { getTypographyVariant } from '$lib/components/ui/foundations/typography';
</script>

<button
	type="button"
	class={getTypographyVariant('h3', 'flex w-full items-center justify-center text-grey-50')}
>
	<slot />
</button>
