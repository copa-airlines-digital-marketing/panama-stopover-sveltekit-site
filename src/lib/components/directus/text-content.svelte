<script lang="ts">
	import type { TextContentSchema } from '$lib/directus/text-content';
	import { Pre } from '../testing';

	export let item: TextContentSchema;
	export let component: string | null;
</script>

<Pre name="Text_Content: {component}" value={item} />
