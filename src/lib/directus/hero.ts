import { z } from 'zod';

export const heroSlideSchema = z.object({
	id: z.string().uuid(),
	title: z.string(),
	eyebrow: z.string(),
	descriptionHtml: z.string(),
	image: z.string().uuid(),
	alt: z.string(),
	icon: z.string().nullable(),
	ctas: z.array(
		z.object({ text: z.string(), link: z.string(), open_in: z.enum(['_self', '_blank']) })
	)
});
export const heroBlockSchema = z.object({
	kind: z.literal('hero-block'),
	id: z.string().uuid(),
	variant: z.enum(['hero-a', 'hero-b', 'hero-c']),
	heading: z.enum(['h1', 'h2']),
	slides: z.array(heroSlideSchema).min(1),
	locale: z.enum(['es', 'en', 'pt'])
});
export type HeroSlide = z.infer<typeof heroSlideSchema>;
export type HeroBlock = z.infer<typeof heroBlockSchema>;

export const heroQueryFields = [
	'id',
	'status',
	'variant',
	'image',
	{
		translations: [
			'id',
			'languages_code',
			'eyebrow',
			'title',
			'description',
			'media',
			'decorative',
			'alt_text',
			'call_to_actions',
			{ icon: ['image'] }
		]
	}
];
export const heroCarouselQueryFields = [
	'id',
	'status',
	'variant',
	{ slides: ['id', 'sort', { hero_id: heroQueryFields }] }
];

export function isSafeHeroLink(value: string) {
	// Reject control characters that URL parsing would otherwise normalize away.
	// eslint-disable-next-line no-control-regex
	if (/[\s\\\u0000-\u001f\u007f]/.test(value)) return false;
	if (/^\/(?!\/)/.test(value)) return true;
	try {
		const url = new URL(value);
		return url.protocol === 'https:' && !url.username && !url.password;
	} catch {
		return false;
	}
}
