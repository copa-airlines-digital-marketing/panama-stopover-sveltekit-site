<script lang="ts">
	import type { TextContentSchema } from '$lib/directus/text-content';
	import { page } from '$app/stores';
	import { Breadcrum } from '$lib/components/site/navigation/breadcrum';
	import { Heading } from '$ui/components/typography';
	export let item: TextContentSchema;
	$: content = item.translations[0];
</script>

<article class="legal-article container-grid">
	<header class="col-start-2 pt-28 pb-8">
		{#if $page.data.page}<Breadcrum item={$page.data.page} />{/if}
		<Heading tag="h1" variant="display" class="text-primary-main">{content.title}</Heading>
	</header>
	<div class="article-body col-start-2 pb-12">
		<!-- eslint-disable-next-line svelte/no-at-html-tags -- prepareArticleSections sanitizes this article's HTML on the server. -->
		{@html item.articleHtml || ''}
	</div>
</article>

<style>
	.legal-article :global(h1) {
		color: #0032a0;
	}
	.legal-article {
		background: #fff;
		color: #333;
	}
	.article-body {
		max-width: 80ch;
		min-width: 0;
		overflow-wrap: anywhere;
		font-family: "Suisse Int'l", sans-serif;
		font-size: 1rem;
		line-height: 1.65;
	}
	.article-body :global(p) {
		margin: 1rem 0;
	}
	.article-body :global(h2),
	.article-body :global(h3),
	.article-body :global(h4) {
		font-family: Gilroy, sans-serif;
		font-weight: 700;
		color: #0032a0;
		margin: 2rem 0 1rem;
		line-height: 1.25;
	}
	.article-body :global(h2) {
		font-size: 2rem;
	}
	.article-body :global(h3) {
		font-size: 1.5rem;
	}
	.article-body :global(h4) {
		font-size: 1.25rem;
	}
	.article-body :global(a) {
		color: #0032a0;
		text-decoration: underline;
		text-underline-offset: 3px;
	}
	.article-body :global(a:focus-visible) {
		outline: 2px solid #0032a0;
		outline-offset: 4px;
	}
	.article-body :global(ul),
	.article-body :global(ol) {
		padding-left: 1.5rem;
		margin: 1rem 0;
	}
	.article-body :global(ul) {
		list-style: disc;
	}
	.article-body :global(ol) {
		list-style: decimal;
	}
	.article-body :global(li) {
		margin: 0.5rem 0;
	}
	.article-body :global(img) {
		max-width: 100%;
		height: auto;
	}
	.article-body :global(table) {
		display: block;
		max-width: 100%;
		overflow-x: auto;
	}
	.article-body :global(th),
	.article-body :global(td) {
		padding: 0.5rem;
		border: 1px solid #ccc;
	}
</style>
