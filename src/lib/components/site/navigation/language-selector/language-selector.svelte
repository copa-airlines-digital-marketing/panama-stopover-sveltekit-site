<script lang="ts">
	import { getPageCannonicals } from '$lib/components/directus/context';
	import { buttonVariants } from '$ui/components/button';
	import { SVG } from '$lib/components/ui/icon';
	import { getTypographyVariant } from '$lib/components/ui/typography';
	import { Linkbar } from '$lib/components/ui/menu/linkbar';
	import {
		ModalBody,
		ModalRoot,
		ModalContent,
		ModalClose,
		ModalTrigger,
		ModalTitle
	} from '$lib/components/ui/modal';
	import type { NavigationSchema } from '$lib/directus/navigation';
	import { page } from '$app/stores';
	import { dissoc } from 'ramda';
	import { browser } from '$app/environment';
	import { cn } from '$lib/utils';

	export let navigation: NavigationSchema;

	const {
		icon,
		translations: { 0: translation }
	} = navigation;

	const locale = $page.data.locale;

	const environment = $page.data.environment;

	let cannonicals = getPageCannonicals();

	$: possibleTranslations = dissoc(locale, $cannonicals);

	const getParams = () => (environment === 'preview' && browser ? document.location.search : '');
</script>

<ModalRoot>
	<ModalTrigger
		class={cn(buttonVariants({ variant: 'transparent-primary-main' }), 'hover:cursor-pointer')}
	>
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
			<ModalTitle class={getTypographyVariant('h3', 'text-primary-dark mt-8 mb-6')}
				>{translation.title}</ModalTitle
			>
			<nav aria-label={translation.title}>
				<ul class="space-y-4">
					{#each translation.links as link}
						{@const { icon, text, target, hreflang, rel } = link.links_id}
						{#if possibleTranslations[hreflang]}
							<li>
								<Linkbar
									href={possibleTranslations[hreflang] + getParams()}
									{target}
									{hreflang}
									rel={rel?.join(' ')}
									let:children
								>
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
						{/if}
					{/each}
				</ul>
			</nav>
		</ModalBody>
	</ModalContent>
</ModalRoot>
