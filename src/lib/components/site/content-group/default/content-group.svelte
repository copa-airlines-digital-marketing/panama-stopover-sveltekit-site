<script lang="ts">
	import { Pre } from '$lib/components/testing';
	import type { ContentGroupSchema } from '$lib/directus/content-group';

	export let item: ContentGroupSchema;

	const title = item.translations?.[0]?.title;
</script>

<div>
	Missing component name or the component name is not mapped
	<h1>
		{title}
	</h1>

	<Pre name="Content Group Content" value={item.content}></Pre>
</div>
