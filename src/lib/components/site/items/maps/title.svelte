<script lang="ts">
	import { cn } from '$lib/utils';
	import { Heading, type HeadingProps } from '$ui/components/typography';

	type $$Props = HeadingProps;

	let className: $$Props['class'] = undefined;
	export { className as class };
</script>

<Heading
	variant="h4"
	tag="h4"
	class={cn('z-10 [grid-area:name]', className)}
	customcn={cn}
	{...$$restProps}
>
	<slot />
</Heading>
