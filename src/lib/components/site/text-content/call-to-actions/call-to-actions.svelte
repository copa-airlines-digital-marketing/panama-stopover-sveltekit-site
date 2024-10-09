<script lang="ts">
	import { Button } from '$lib/components/ui/foundations/button';
	import type { TextContentSchema } from '$lib/directus/text-content';
	import { cn } from '$lib/utils';

	let className: string | null | undefined = undefined;
	export let call_to_actions: TextContentSchema['translations'][0]['call_to_actions'];
	export let stretch = true;
	export let theme: 'light' | 'dark' = 'light';
	export { className as class };

	const variant = [
		`${theme === 'light' ? 'solid-primary-main' : 'solid-primary-light'}`,
		`${theme === 'light' ? 'outline-primary-main' : 'outline-invert'}`
	];
</script>

{#if call_to_actions}
	<ul class={cn('col-start-2 row-start-7 mt-6 flex gap-2', className)}>
		<li class:grow={stretch}>
			{#each call_to_actions as cta, i}
				<Button href={cta.link} target={cta.open_in} variant={variant[i]}>
					{cta.text}
				</Button>
			{/each}
		</li>
	</ul>
{/if}
