<script lang="ts">
	import type { HTMLAttributes } from 'svelte/elements';
	import { cn } from '$lib/utils';
	import { Avatar, Name } from './index';

	type $$Props = HTMLAttributes<HTMLDivElement>;

	let className: $$Props['class'] = undefined;
	export { className as class };

	let children = {
		Avatar,
		Name
	};
</script>

<div
	class={cn(
		'grid grid-cols-[auto_1fr] items-center gap-6 rounded-2xl border border-primary-faded p-4 [grid-template-areas:"avatar_name""contact_contact""social_social"] sm:justify-items-end min-[600px]:[grid-template-areas:"avatar_name_contact""avatar_name_social"]',
		className
	)}
>
	<slot {...children} />
</div>
