<script lang="ts">
	import { Button } from '$lib/components/ui/foundations/button';
	import type { TextContentSchema } from '$lib/directus/text-content';

	export let call_to_actions: TextContentSchema['translations'][0]['call_to_actions'];
	export let theme: 'light' | 'dark' = 'light';

	const variant = [
		`${theme === 'light' ? 'solid-primary-main' : 'solid-primary-light'}`,
		`${theme === 'light' ? 'outline-primary-main' : 'outline-invert'}`
	];
</script>

{#if call_to_actions}
	<ul class="col-start-2 row-start-7 mt-6 flex gap-2">
		<li class="flex-grow">
			{#each call_to_actions as cta, i}
				<Button href={cta.link} target={cta.open_in} variant={variant[i]}>
					{cta.text}
				</Button>
			{/each}
		</li>
	</ul>
{/if}
