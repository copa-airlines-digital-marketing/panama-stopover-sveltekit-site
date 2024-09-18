<script lang="ts">
	import { Button } from '$lib/components/ui/foundations/button';
	import type { NavigationSchema } from '$lib/directus/navigation';
	import { say } from '$lib/utils';

	export let navigation: NavigationSchema;

	const {
		translations: {
			0: { links }
		}
	} = navigation;
</script>

<nav aria-label={navigation.translations[0].title} class="container fixed bottom-0 left-0 w-full">
	<ul
		class="container mx-auto my-6 flex items-center justify-between gap-2 rounded-lg bg-backgound-paper shadow-md"
	>
		{#each links as link}
			{@const { href, text, target } = link.links_id}
			<li>
				<Button {href} {target} size="slim" variant="transparent-primary-main">
					{text}
				</Button>
			</li>
		{:else}
			{say('no items inculded', navigation)}
		{/each}
	</ul>
</nav>
