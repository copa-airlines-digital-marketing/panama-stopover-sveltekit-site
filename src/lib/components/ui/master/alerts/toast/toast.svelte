<script lang="ts">
	import { Toaster, type ToasterProps } from 'svelte-sonner';

	type $$Props = ToasterProps;
</script>

<Toaster class="toaster group" position="top-center" richColors {...$$restProps} />
