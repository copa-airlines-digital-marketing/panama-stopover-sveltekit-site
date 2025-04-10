<script lang="ts">
	import { DropdownMenu as DropdownMenuPrimitive } from 'bits-ui';

	type $$Props = DropdownMenuPrimitive.Props;
</script>

<DropdownMenuPrimitive.Root {...$$restProps}>
	<slot Trigger={DropdownMenuPrimitive.Trigger} />
</DropdownMenuPrimitive.Root>
