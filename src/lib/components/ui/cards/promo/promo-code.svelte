<script lang="ts">
	import { browser } from '$app/environment';
	import { toast } from 'svelte-sonner';
	import { buttonVariants } from '$ui/components/button';
	import { cn } from '$lib/utils';

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
	class={cn(
		buttonVariants({ variant: 'transparent-primary-main', size: 'large' }),
		'text-grey-50 focus-visible:outline-grey-50 focus:outline-grey-50 active:outline-grey-50 mx-auto cursor-copy font-semibold'
	)}
	on:click={copyCode}
>
	<slot />
</button>
