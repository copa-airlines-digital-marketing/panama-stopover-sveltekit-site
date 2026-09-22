<script lang="ts">
	import HeroBlock from '$lib/components/site/hero/hero-block.svelte';
	export let data;
	const labels = { es: 'Vista previa', en: 'Preview', pt: 'Prévia' };
	const empty = {
		es: 'Este bloque todavía no tiene contenido completo para este idioma.',
		en: 'This block does not have complete content for this language yet.',
		pt: 'Este bloco ainda não tem conteúdo completo para este idioma.'
	};
</script>

<svelte:head
	><title>{labels[data.previewLocale as keyof typeof labels]} | Panama Stopover</title><meta
		name="robots"
		content="noindex,nofollow"
	/></svelte:head
>
<main>
	{#if data.item}<HeroBlock item={data.item} />{:else}<p class="p-8">
			{empty[data.previewLocale as keyof typeof empty]}
		</p>{/if}
</main>
