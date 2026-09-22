<script lang="ts">
	import { page } from '$app/stores';
	const messages = {
		es: 'Vista previa no disponible',
		en: 'Preview unavailable',
		pt: 'Prévia indisponível'
	};
	$: locale = $page.params.locale as keyof typeof messages;
</script>

<main class="p-8">
	<h1>{messages[locale] || messages.es}</h1>
	<p>{$page.status}</p>
</main>
