<script>
	import { Procesor } from '$lib/components/directus';

	export let data;

	const { environment, siteSettings, layout, layoutSections, page, pageSections, locale } = data;
</script>

<Procesor {siteSettings} {layout} {layoutSections} {page} {pageSections} {environment} {locale} />
