<script lang="ts">
	import { cn, flyAndScale } from '$lib/utils';
	import { DropdownMenu as DropdownMenuPrimitive } from 'bits-ui';

	type $$Props = DropdownMenuPrimitive.ContentProps;

	let className: $$Props['class'] = undefined;
	export { className as class };
</script>

<DropdownMenuPrimitive.Content
	class={cn('w-full max-w-56 rounded-md bg-backgound-paper shadow-md', className)}
	transition={flyAndScale}
	{...$$restProps}
>
	<slot Item={DropdownMenuPrimitive.Item} />
</DropdownMenuPrimitive.Content>
