<script lang="ts">
	import { cn } from '$lib/utils';
	import type { HTMLAttributes } from 'svelte/elements';

	type $$Props = HTMLAttributes<SVGAElement>;

	let className: $$Props['class'] = undefined;
	export { className as class };
</script>

<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" class={cn(className)} {...$$restProps}>
	<path
		d="M9.29961 17.3C8.91301 16.9134 8.91301 16.2866 9.29961 15.9L13.1996 12L9.29961 8.1C8.91301 7.7134 8.91301 7.0866 9.29961 6.7C9.68621 6.3134 10.313 6.3134 10.6996 6.7L15.2925 11.2929C15.683 11.6834 15.683 12.3166 15.2925 12.7071L10.6996 17.3C10.313 17.6866 9.68621 17.6866 9.29961 17.3Z"
	/>
</svg>
