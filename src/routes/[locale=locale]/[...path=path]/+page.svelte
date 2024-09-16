<script>
	import { Procesor } from '$lib/components/directus';

	export let data;

	const {
		environment,
		siteSettings,
		layout,
		page,
		stopover_hotels,
		stopover_place_to_visit,
		stopover_restaurants
	} = data;
</script>

<Procesor
	{siteSettings}
	{layout}
	{page}
	{stopover_hotels}
	{stopover_place_to_visit}
	{stopover_restaurants}
	{environment}
></Procesor>
