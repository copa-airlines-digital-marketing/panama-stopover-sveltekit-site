import type { HeroBlock } from '$lib/directus/hero';

const seal = 'https://cm-marketing.directus.app/assets/f784d895-17b0-485b-b11e-f56876dbfc96';

// Preview content belongs to this development page, not the shared CMS.
export const eventsHero = {
	kind: 'hero-block',
	id: 'b042baf3-b387-4bcf-8bab-81928d8d3f5e',
	variant: 'hero-a',
	heading: 'h1',
	locale: 'es',
	slides: [
		{
			id: 'e9c0e95c-215f-4891-9150-27190a4237ec',
			title: 'Eventos en Panamá',
			eyebrow: 'Panamá Stopover',
			descriptionHtml:
				'<p>Consulta la agenda de conciertos, cultura y actividades para las fechas de tu visita.</p>',
			image: '9999e528-b3ba-4985-a06b-aa983999ca84',
			alt: '',
			icon: seal,
			ctas: [{ text: 'Ver agenda', link: '#agenda', open_in: '_self' }]
		},
		{
			id: '3a461c48-19b1-4c17-91a1-1d1d5e90d699',
			title: 'Más planes para tu escala',
			eyebrow: 'Entre un evento y otro',
			descriptionHtml:
				'<p>Completa tu visita con un recorrido por la ciudad o una salida a la naturaleza.</p>',
			image: '488f7192-bde8-4645-a929-6323d026b8bb',
			alt: '',
			icon: seal,
			ctas: [{ text: 'Explorar Panamá', link: '/es/conoce-panama/', open_in: '_self' }]
		}
	]
} satisfies HeroBlock;
