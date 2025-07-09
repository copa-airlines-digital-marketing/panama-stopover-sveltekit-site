<script lang="ts">
	import { cn } from '$lib/utils';
	import type { HTMLAttributes } from 'svelte/elements';

	type $$Props = HTMLAttributes<SVGAElement>;

	let className: $$Props['class'] = undefined;
	export { className as class };
</script>

<svg
	viewBox="0 0 24 24"
	fill="current"
	xmlns="http://www.w3.org/2000/svg"
	class={cn(className)}
	{...$$restProps}
>
	<path
		d="M12.3 2.7C11.9134 3.0866 11.9134 3.7134 12.3 4.1L19.2 11H2C1.44771 11 1 11.4477 1 12C1 12.5523 1.44772 13 2 13H19.2L12.3 19.9C11.9134 20.2866 11.9134 20.9134 12.3 21.3C12.6866 21.6866 13.3134 21.6866 13.7 21.3L22.2929 12.7071C22.6834 12.3166 22.6834 11.6834 22.2929 11.2929L13.7 2.7C13.3134 2.3134 12.6866 2.3134 12.3 2.7Z"
	/>
</svg>
