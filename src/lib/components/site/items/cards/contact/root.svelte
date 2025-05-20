<script lang="ts">
	import type { HTMLAttributes } from 'svelte/elements';
	import { cn } from '$lib/utils';
	import { Avatar, Contact, Name, Socials } from './index';

	type $$Props = HTMLAttributes<HTMLDivElement>;

	let className: $$Props['class'] = undefined;
	export { className as class };

	let children = {
		Avatar,
		Contact,
		Name,
		Socials
	};
</script>

<div
	class={cn(
		'grid grid-cols-[auto_1fr] items-center gap-4 rounded-2xl border border-primary-faded p-4 [grid-template-areas:"avatar_name""contact_contact""social_social"]',
		className
	)}
>
	<slot {...children} />
</div>
