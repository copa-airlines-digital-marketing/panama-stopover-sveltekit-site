<script lang="ts">
	import { Pre } from '$lib/components/testing';
	import type { HeaderSchema } from '$lib/directus/header';

	export let item: HeaderSchema;
	export let component: string | null | undefined;
</script>

<Pre name={component} value={item}></Pre>
