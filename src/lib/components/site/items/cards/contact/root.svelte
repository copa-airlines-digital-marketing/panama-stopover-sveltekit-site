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

<div class={cn('grid rounded-2xl border border-grey-300', className)}>
	<slot {...children} />
</div>
