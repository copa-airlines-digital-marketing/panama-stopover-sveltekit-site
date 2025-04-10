<script lang="ts">
	import { browser } from '$app/environment';
	import { getTypographyVariant } from '$lib/components/ui/typography';
	import { toast } from 'svelte-sonner';

	let btn: HTMLButtonElement;

	export let successMesage: string;
	export let errroMesage: string;

	const copyCode = () => {
		if (browser && navigator.clipboard && btn)
			navigator.clipboard
				.writeText(btn.innerText)
				.then(() => {
					toast.success(successMesage);
				})
				.catch(() => {
					toast.error(errroMesage);
				});
		return;
	};
</script>

<button
	type="button"
	bind:this={btn}
	class={getTypographyVariant('h3', 'flex w-full items-center justify-center text-grey-50')}
	on:click={copyCode}
>
	<slot />
</button>
