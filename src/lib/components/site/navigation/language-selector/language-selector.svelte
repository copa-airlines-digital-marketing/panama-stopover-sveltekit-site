<script lang="ts">
	import { buttonVariants } from '$lib/components/ui/foundations/button';
	import Button from '$lib/components/ui/foundations/button/button.svelte';
	import { SVG } from '$lib/components/ui/foundations/icon';
	import { getTypographyVariant } from '$lib/components/ui/foundations/typography';
	import { Linkbar } from '$lib/components/ui/patterns/menu/linkbar';
	import {
		ModalBody,
		ModalRoot,
		ModalContent,
		ModalClose,
		ModalTrigger,
		ModalTitle
	} from '$lib/components/ui/patterns/modal';
	import type { NavigationSchema } from '$lib/directus/navigation';

	export let navigation: NavigationSchema;

	const {
		icon,
		translations: { 0: translation }
	} = navigation;
</script>

<ModalRoot>
	<ModalTrigger class={buttonVariants({ variant: 'transparent-primary-main' })}>
		{#if icon}
			<SVG data={icon.code} class="size-6" title={translation.title} />
			<span class="sr-only">{translation.title}</span>
		{:else}
			{translation.title}
		{/if}
	</ModalTrigger>
	<ModalContent size="narrow">
		<ModalClose />
		<ModalBody>
			<ModalTitle class={getTypographyVariant('h3', 'mb-6 mt-8 text-primary-dark')}
				>{translation.title}</ModalTitle
			>
			<nav aria-label={translation.title}>
				<ul class="space-y-4">
					{#each translation.links as link}
						{@const { icon, href, text, target, hreflang, rel } = link.links_id}
						<li class="">
							<Linkbar {href} {target} {hreflang} rel={rel?.join(' ')} let:children>
								{@const { Icon, Title } = children}
								{#if icon}
									<Icon>
										<SVG data={icon?.code} class="w-auto" title={text}></SVG>
									</Icon>
								{/if}
								<Title>
									{text}
								</Title>
							</Linkbar>
						</li>
					{/each}
				</ul>
			</nav>
		</ModalBody>
	</ModalContent>
</ModalRoot>
