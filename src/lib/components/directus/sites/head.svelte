<script lang="ts">
	import { any, isNotNil } from 'ramda';
	import { getPageCannonicals } from '../context';
	import { isNotEmpty } from 'ramda';
	import { page } from '$app/stores';

	export let site_head_code: string | null | undefined = undefined;
	export let layout_head_code: string | null | undefined = undefined;
	export let page_head_code: string | null | undefined = undefined;
	export let indexPage: boolean;

	$: locale = $page.data.locale;

	let cannonicals = getPageCannonicals();
</script>

<svelte:head>
	{#if !indexPage}
		<meta name="robots" content="noindex" />
	{/if}
	{#if any(isNotNil, [site_head_code, layout_head_code, page_head_code])}
		{@html page_head_code || layout_head_code || site_head_code}
	{/if}
	{#if isNotNil($cannonicals) && isNotEmpty($cannonicals)}
		{#each Object.keys($cannonicals) as lang}
			{@const hreflang = lang !== locale ? lang : undefined}
			<link
				rel={lang === locale ? 'cannonical' : 'alternate'}
				{hreflang}
				href="https://panama-stopover.com{$cannonicals[lang]}"
			/>
		{/each}
	{/if}
</svelte:head>
