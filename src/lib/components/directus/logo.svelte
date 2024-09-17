<script lang="ts">
	import type { LogoSchema } from '$lib/directus/logos';
	import { SVG } from '../foundations/icon';

	export let item: LogoSchema;
	export let component: string | null;
</script>

<SVG data={item.code} class="max-h-14" />
