<script>
	import { default as Icon } from './promo-icon.svelte';
	import { default as Discount } from './promo-discount.svelte';

	const children = { Icon, Discount };
</script>

<div class="mb-6 flex items-center justify-center gap-2">
	<slot {...children} />
</div>
