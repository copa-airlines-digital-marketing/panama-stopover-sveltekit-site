<script lang="ts">
	import { Button } from '$lib/components/ui/foundations/button';
	import { SVG } from '$lib/components/ui/foundations/icon';
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
	<ul>
		{#each links as link}
			{@const { icon, href, text, target } = link.links_id}
			<li>
				<Button
					{href}
					{target}
					size="icon-only"
					variant="transparent-primary-main"
					class="max-h-none px-4 py-0.5"
				>
					{#if icon}
						<SVG data={icon?.code} class="h-14 w-auto"></SVG>
					{:else}
						{text}
					{/if}
				</Button>
			</li>
		{:else}
			{say('no items inculded', navigation)}
		{/each}
	</ul>
</nav>
