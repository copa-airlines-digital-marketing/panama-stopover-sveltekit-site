<script>
	import { Procesor } from '$lib/components/directus';
	import { page } from '$app/stores'

</script>

{#key $page}
<Procesor></Procesor>
{/key}