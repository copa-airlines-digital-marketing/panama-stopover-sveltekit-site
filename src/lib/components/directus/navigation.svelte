<script lang="ts">
	import type { NavigationSchema } from '$lib/directus/navigation';
	import { Pre } from '../testing';

	export let item: NavigationSchema;
	export let component: string | null;
</script>

<Pre name="Navigation: {component}" value={item} />
