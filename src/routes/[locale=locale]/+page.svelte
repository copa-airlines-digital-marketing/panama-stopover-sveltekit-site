<script>
	import { Procesor } from '$lib/components/directus';

	export let data;

	const { environment, siteSettings, layout, page } = data;
</script>

<Procesor {siteSettings} {layout} {page} {environment} />
