import { z } from 'zod';
import sanitizeHtml from 'sanitize-html';
import {
	heroBlockSchema,
	isSafeHeroLink,
	type HeroBlock,
	type HeroSlide
} from '$lib/directus/hero';

const status = z.enum(['draft', 'published', 'archived']);
const rawHero = z.object({
	id: z.string().uuid(),
	status,
	image: z.string().uuid().nullish(),
	translations: z.array(z.unknown())
});
const translation = z.object({
	languages_code: z.enum(['es', 'en', 'pt']),
	title: z.string().trim().min(1),
	eyebrow: z.string().nullish(),
	description: z.string().nullish(),
	media: z.string().uuid().nullish(),
	decorative: z.boolean(),
	alt_text: z.string().nullish(),
	icon: z.object({ image: z.string().nullish(), code: z.string().nullish() }).nullish(),
	call_to_actions: z
		.array(
			z.object({
				text: z.string().trim().min(1),
				link: z.string().refine(isSafeHeroLink),
				open_in: z.enum(['_self', '_blank']).default('_self')
			})
		)
		.nullish()
});
const rawCarousel = z.object({
	id: z.string().uuid(),
	status,
	variant: z.string().nullish(),
	slides: z.array(z.unknown())
});
const relation = z.object({
	id: z.string().uuid(),
	sort: z.number().finite().nullish(),
	hero_id: z.unknown()
});
const record = (v: unknown): v is Record<string, unknown> =>
	!!v && typeof v === 'object' && !Array.isArray(v);
export const cleanHeroHtml = (value: string) =>
	sanitizeHtml(value, {
		allowedTags: ['p', 'br', 'strong', 'b', 'em', 'i', 'ul', 'ol', 'li'],
		allowedAttributes: {},
		disallowedTagsMode: 'discard'
	});

function slide(value: unknown, locale: string, preview: boolean): HeroSlide | null {
	const parsed = rawHero.safeParse(value);
	if (!parsed.success || (!preview && parsed.data.status !== 'published')) return null;
	const h = parsed.data;
	const matches = h.translations.filter((t) => record(t) && t.languages_code === locale);
	if (matches.length !== 1) return null;
	const translated = translation.safeParse(matches[0]);
	if (!translated.success) return null;
	const t = translated.data,
		image = t.media || h.image;
	if (!image || (!t.decorative && !t.alt_text?.trim())) return null;
	// An SVG in an img resource cannot execute script or supply interactive markup.
	const icon = t.icon?.code?.trim().startsWith('<svg')
		? `data:image/svg+xml,${encodeURIComponent(t.icon.code)}`
		: t.icon?.image && z.string().uuid().safeParse(t.icon.image).success
			? `https://cm-marketing.directus.app/assets/${t.icon.image}`
			: null;
	return {
		id: h.id,
		title: t.title,
		eyebrow: t.eyebrow?.trim() || '',
		descriptionHtml: cleanHeroHtml(t.description || ''),
		image,
		alt: t.decorative ? '' : t.alt_text!.trim(),
		icon,
		ctas: t.call_to_actions || []
	};
}

export function adaptHeroBlock(
	collection: string,
	value: unknown,
	locale: string,
	preview = false,
	heading: 'h1' | 'h2' = 'h2'
): HeroBlock | null {
	if (!['es', 'en', 'pt'].includes(locale)) return null;
	let id: string, slides: HeroSlide[];
	let variant: HeroBlock['variant'] = 'hero-a';
	if (collection === 'block_hero') {
		const item = slide(value, locale, preview);
		if (!item) return null;
		if (record(value) && (value.variant === 'hero-b' || value.variant === 'hero-c'))
			variant = value.variant;
		else if (record(value) && value.variant && value.variant !== 'hero-a')
			console.warn('[hero] Unknown variant; using hero-a', { id: item.id });
		id = item.id;
		slides = [item];
	} else if (collection === 'block_hero_carousel') {
		const parsed = rawCarousel.safeParse(value);
		if (!parsed.success || (!preview && parsed.data.status !== 'published')) return null;
		id = parsed.data.id;
		if (parsed.data.variant && parsed.data.variant !== 'hero-a')
			console.warn('[hero] Unknown variant; using hero-a', { id });
		const seen = new Set<string>();
		slides = parsed.data.slides
			.flatMap((v) => {
				const r = relation.safeParse(v);
				return r.success ? [r.data] : [];
			})
			.sort((a, b) => (a.sort ?? 0) - (b.sort ?? 0) || a.id.localeCompare(b.id))
			.flatMap((r) => {
				const s = slide(r.hero_id, locale, preview);
				if (!s || seen.has(s.id)) return [];
				seen.add(s.id);
				return [s];
			});
	} else return null;
	if (!slides.length) return null;
	return heroBlockSchema.parse({
		kind: 'hero-block',
		id,
		variant,
		heading,
		slides,
		locale
	});
}

export function prepareHeroSections(value: unknown, locale: string, preview = false): unknown {
	if (!Array.isArray(value)) return value;
	let mainHeading = false;
	return value.map((section) => {
		if (!record(section) || !Array.isArray(section.section_content)) return section;
		return {
			...section,
			section_content: section.section_content.flatMap((entry) => {
				if (
					!record(entry) ||
					!['block_hero', 'block_hero_carousel'].includes(String(entry.collection))
				)
					return [entry];
				const heading = section.landmark === 'hero' && !mainHeading ? 'h1' : 'h2';
				const item = adaptHeroBlock(String(entry.collection), entry.item, locale, preview, heading);
				if (!item) {
					console.warn('[hero] Omitted invalid or unavailable block', { id: entry.id });
					return [];
				}
				if (heading === 'h1') mainHeading = true;
				return [{ ...entry, item }];
			})
		};
	});
}
