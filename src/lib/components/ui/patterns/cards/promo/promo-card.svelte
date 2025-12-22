<script lang="ts">
	import { cn } from '$lib/utils';
	import { promoCardVariants, type promoCardProps } from './variants';
	import { default as Title } from './promo-title.svelte';
	import { default as Description } from './promo-description.svelte';
	import { default as CodeTitle } from './promo-code-title.svelte';
	import { default as Header } from './promo-header.svelte';
	import { default as Code } from './promo-code.svelte';

	type $$Props = promoCardProps;

	let className: $$Props['class'] = undefined;
	export { className as class };
	export let theme: $$Props['theme'] = 'DEFAULT';

	const children = {
		Header,
		Title,
		Description,
		CodeTitle,
		Code
	};
</script>

<div class={cn(promoCardVariants({ theme }), className)}>
	<slot {...children} />
</div>
