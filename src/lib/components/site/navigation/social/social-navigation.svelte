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
			{@const { href, text, target, rel, icon } = link.links_id}
			<li>
				<Button
					{href}
					{target}
					rel={rel?.join(' ')}
					size="slim"
					variant="transparent-primary-main"
					class="text-grey-600 hover:text-grey-800 font-jakarta"
					title={text}
				>
					{#if icon}
						<SVG data={icon.code} title={text} class="w-auto fill-current"></SVG>
					{/if}
					<span class="sr-only">
						{text}
					</span>
				</Button>
			</li>
		{:else}
			{say('no items inculded', navigation)}
		{/each}
	</ul>
</nav>
