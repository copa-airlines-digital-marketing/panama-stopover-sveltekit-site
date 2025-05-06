<script lang="ts">
	import { Button } from '$ui/components/button';
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
		class="bg-background-paper container mx-auto flex items-center justify-between rounded-lg px-4 py-2 shadow-md shadow-black/20 md:max-w-full md:justify-end md:gap-2 md:shadow-none"
	>
		{#each links as link}
			{@const { href, text, target } = link.links_id}
			<li>
				<Button
					{href}
					{target}
					size="slim"
					variant="transparent-primary-main"
					class="text-d1 font-jakarta px-2 py-1 font-semibold"
				>
					{text}
				</Button>
			</li>
		{:else}
			{say('no items inculded', navigation)}
		{/each}
	</ul>
</nav>
