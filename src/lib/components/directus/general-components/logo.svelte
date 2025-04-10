<script lang="ts">
	import { SVG } from '$lib/components/ui/icon';
	import type { LogoSchema } from '$lib/directus/logos';

	export let item: LogoSchema;
</script>

<SVG data={item.code} class="max-h-14" />
