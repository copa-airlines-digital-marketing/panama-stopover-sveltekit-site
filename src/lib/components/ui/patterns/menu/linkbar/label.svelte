<script>
	import { getTypographySize } from '$lib/components/ui/foundations/typography';
</script>

<span class={getTypographySize('overline-small', 'col-start-2 row-start-1 self-end')}>
	<slot />
</span>
