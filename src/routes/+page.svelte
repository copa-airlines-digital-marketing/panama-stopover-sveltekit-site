<script lang="ts">
	import { PUBLIC_SUPPORTED_LANGUAGES } from '$env/static/public';
	import { onMount } from 'svelte';

	const supportedLocales = PUBLIC_SUPPORTED_LANGUAGES.split(',')
		.map((locale) => locale.trim().toLowerCase())
		.filter(Boolean);

	const defaultLocale = supportedLocales[0] || 'es';

	const getBrowserPreferredLocale = () => {
		if (typeof window === 'undefined') return defaultLocale;

		const browserLocales = [...(navigator.languages || []), navigator.language]
			.filter(Boolean)
			.map((locale) => locale.toLowerCase());

		for (const browserLocale of browserLocales) {
			if (supportedLocales.includes(browserLocale)) return browserLocale;

			const [baseLocale] = browserLocale.split('-');
			if (baseLocale && supportedLocales.includes(baseLocale)) return baseLocale;
		}

		return defaultLocale;
	};

	const fallbackHref = `/${defaultLocale}/`;

	onMount(() => {
		const preferredLocale = getBrowserPreferredLocale();
		window.location.replace(`/${preferredLocale}/`);
	});
</script>

<svelte:head>
	<meta http-equiv="refresh" content={`0;url=${fallbackHref}`} />
</svelte:head>

<a href={fallbackHref}>Redirecting...</a>
