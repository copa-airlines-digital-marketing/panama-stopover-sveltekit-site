<script lang="ts">
	import HeroBlock from '../../src/lib/components/site/hero/hero-block.svelte';
	import type { HeroBlock as Block } from '../../src/lib/directus/hero';
	const params = new URLSearchParams(location.search);
	let count = Number(params.get('count') ?? 5);
	const locale = (params.get('locale') || 'es') as Block['locale'];
	const long = params.has('long');
	const titles = { es: 'Descubre Panamá', en: 'Discover Panama', pt: 'Descubra o Panamá' };
	$: item = {
		kind: 'hero-block',
		id: '11111111-1111-4111-8111-111111111111',
		variant: 'hero-a',
		heading: 'h1',
		locale,
		slides: Array.from({ length: count }, (_, i) => ({
			id: `00000000-0000-4000-8000-${String(i).padStart(12, '0')}`,
			title: `${titles[locale]} ${i + 1}${long ? ': una escala para conocer sus paisajes y disfrutar de nuevas experiencias' : ''}`,
			eyebrow: 'Panama Stopover',
			descriptionHtml: '<p>Haz de tu escala una experiencia para recordar.</p>',
			image: '00000000-0000-4000-8000-000000000000',
			alt: 'Paisaje de Panamá',
			icon: null,
			ctas: [{ text: 'Explorar Panamá', link: '#contenido', open_in: '_self' as const }]
		}))
	} satisfies Block;
</script>

<HeroBlock {item} />
<footer
	id="contenido"
	style="padding: 32px; min-height: 180px; color: #0032a0; font-family: sans-serif"
>
	<p>Componente Svelte · datos de prueba locales · {count} slides</p>
	<button type="button" on:click={() => (count = count ? 0 : 5)}>Montar/desmontar carrusel</button>
</footer>
