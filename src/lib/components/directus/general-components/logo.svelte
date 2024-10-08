<script lang="ts">
	import { SVG } from '$lib/components/ui/foundations/icon';
	import type { LogoSchema } from '$lib/directus/logos';

	export let item: LogoSchema;
</script>

<SVG data={item.code} class="max-h-14" />
