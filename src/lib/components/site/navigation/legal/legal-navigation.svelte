<script lang="ts">
	import { Button } from '$ui/components/button';
	import { SVG } from '$lib/components/ui/icon';
	import type { NavigationSchema } from '$lib/directus/navigation';
	import { say } from '$lib/utils';

	export let navigation: NavigationSchema;

	const {
		translations: {
			0: { links }
		}
	} = navigation;
</script>

<nav aria-label={navigation.translations[0].title}>
	<ul class="flex gap-4">
		{#each links as link}
			{@const { href, text, target, rel } = link.links_id}
			<li>
				<Button
					{href}
					{target}
					rel={rel?.join(' ')}
					size="link"
					variant="link"
					class="text-d3 text-primary-light sm:text-d3 md:text-d3 lg:text-d3 font-normal"
				>
					{text}
				</Button>
			</li>
		{:else}
			{say('no items inculded', navigation)}
		{/each}
	</ul>
</nav>
