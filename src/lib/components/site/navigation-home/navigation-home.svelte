<script lang="ts">
	import type { NavigationSchema } from '$lib/directus/navigation';
	import { say } from '$lib/utils';

	export let navigation: NavigationSchema;

	const {
		translations: {
			0: { items }
		}
	} = navigation;
</script>

<nav>
	<ul>
		{#each items as item}
			{@const { icon, href, text, target } = item}
			<li></li>
		{:else}
			{say('no items inculded', navigation)}
		{/each}
	</ul>
</nav>
