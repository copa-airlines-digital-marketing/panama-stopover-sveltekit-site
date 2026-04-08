<script lang="ts">
	import { page } from '$app/stores';
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

	const hasProtocol = (href: string) => /^(https?:)?\/\//.test(href);
	const isSpecialHref = (href: string) =>
		href.startsWith('mailto:') ||
		href.startsWith('tel:') ||
		href.startsWith('#') ||
		hasProtocol(href);

	const normalizeInternalHref = (href: string) => {
		const locale = $page.data.locale || '';
		if (!locale || isSpecialHref(href)) return href;

		const normalized = href.startsWith('/') ? href : `/${href}`;
		const localePrefix = `/${locale}`;

		if (normalized === '/' || normalized === '') return localePrefix;
		if (normalized === localePrefix || normalized.startsWith(`${localePrefix}/`)) return normalized;

		return `${localePrefix}${normalized}`;
	};
</script>

<nav aria-label={navigation.translations[0].title}>
	<ul>
		{#each links as link}
			{@const { icon, href, text, target } = link.links_id}
			<li>
				<Button
					href={normalizeInternalHref(href)}
					{target}
					size="slim"
					variant="transparent-primary-main"
					class="rounded-full *:max-h-14 sm:*:max-h-14 md:*:max-h-14 lg:*:max-h-14"
					title={text}
				>
					{#if icon}
						<SVG data={icon?.code} class="h-8 w-auto  sm:h-14"></SVG>
					{:else}
						{text}
					{/if}
				</Button>
			</li>
		{:else}
			{say('no links inculded', navigation)}
		{/each}
	</ul>
</nav>
