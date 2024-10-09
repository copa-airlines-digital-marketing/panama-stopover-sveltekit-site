<script lang="ts">
	import { Pre } from '$lib/components/testing';
	import type { ButtonProps } from '$lib/components/ui/foundations/button';
	import Button from '$lib/components/ui/foundations/button/button.svelte';
	import { SVG } from '$lib/components/ui/foundations/icon';
	import type { NavigationSchema } from '$lib/directus/navigation';

	export let navigation: NavigationSchema;

	const {
		translations: {
			0: { links }
		}
	} = navigation;

	const buttonVariant: ButtonProps['variant'][] = ['solid-primary-main', 'outline-primary-main'];
</script>

<ul class="flex gap-4">
	{#each links as link, i}
		{@const { href, text, target, rel, icon } = link.links_id}
		<li class="grow">
			<Button {href} {target} rel={rel?.join(' ')} variant={buttonVariant[i]} title={text}>
				{#if icon}
					<SVG data={icon.code} title={text} class="w-auto fill-current"></SVG>
				{/if}
				<span>
					{text}
				</span>
			</Button>
		</li>
	{:else}
		<div>No links in navigation</div>
	{/each}
</ul>
