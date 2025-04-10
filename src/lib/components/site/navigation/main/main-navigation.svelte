<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import type { NavigationSchema } from '$lib/directus/navigation';
	import { say } from '$lib/utils';

	export let navigation: NavigationSchema;

	const {
		translations: {
			0: { links }
		}
	} = navigation;
</script>

<nav
	aria-label={navigation.translations[0].title}
	class="fixed bottom-0 left-0 mx-auto w-screen py-2 md:static"
>
	<ul
		class="md:mx- container mx-auto flex items-center justify-between rounded-lg bg-backgound-paper px-4 py-2 shadow-md shadow-black/20 md:max-w-full md:justify-end md:gap-2 md:shadow-none"
	>
		{#each links as link}
			{@const { href, text, target } = link.links_id}
			<li>
				<Button
					{href}
					{target}
					size="slim"
					variant="transparent-primary-main"
					class="px-2 py-1 text-d1 font-semibold"
				>
					{text}
				</Button>
			</li>
		{:else}
			{say('no items inculded', navigation)}
		{/each}
	</ul>
</nav>
