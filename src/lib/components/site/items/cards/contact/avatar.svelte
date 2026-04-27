<script lang="ts">
	import { cn } from '$lib/utils';
	import { Avatar, Image, Fallback, type Props as CMAvatarProps } from '$ui/components/avatar';

	type $$Props = CMAvatarProps;

	let className: $$Props['class'] = undefined;
	export { className as class };
</script>

<Avatar class={cn('[grid-area:avatar]', className)}>
	<slot {Image} {Fallback} />
</Avatar>
