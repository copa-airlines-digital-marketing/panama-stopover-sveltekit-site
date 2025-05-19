<script lang="ts">
	import { cn } from '$lib/utils';
	import { Avatar, type Props as CMAvatarProps } from '$ui/components/avatar';

	type $$Props = CMAvatarProps;

	let className: $$Props['class'] = undefined;
	export { className as class };
</script>

<Avatar let:Image let:Fallback class={cn('[grid-area:avatar]', className)}>
	<slot {Image} {Fallback} />
</Avatar>
