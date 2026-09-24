import { describe, expect, test } from 'vitest';
import { adaptHeroBlock, cleanHeroHtml, prepareHeroSections } from './hero';
import { isSafeHeroLink } from '$lib/directus/hero';
const id = '9756fda7-6c4d-4522-b951-1247c0cbaf80';
const second = '350885d2-0653-4bc1-9d8f-7b1c1c12255d';
const hero = {
	id,
	status: 'published',
	image: id,
	translations: [{ languages_code: 'es', title: 'Panamá', decorative: true }]
};
const carousel = {
	id,
	status: 'published',
	variant: 'hero-a',
	slides: [
		{ id, sort: 2, hero_id: hero },
		{ id: second, sort: 1, hero_id: { ...hero, id: second } }
	]
};
describe('Hero content boundary', () => {
	test('matches the requested locale without mixing languages', () => {
		expect(adaptHeroBlock('block_hero', hero, 'es')?.slides[0].title).toBe('Panamá');
		expect(adaptHeroBlock('block_hero', hero, 'pt')).toBeNull();
		expect(
			adaptHeroBlock(
				'block_hero',
				{ ...hero, translations: [...hero.translations, ...hero.translations] },
				'es'
			)
		).toBeNull();
	});
	test('filters drafts on both parents and children', () => {
		expect(adaptHeroBlock('block_hero', { ...hero, status: 'draft' }, 'es')).toBeNull();
		expect(
			adaptHeroBlock('block_hero_carousel', { ...carousel, status: 'draft' }, 'es')
		).toBeNull();
		expect(adaptHeroBlock('block_hero', { ...hero, status: 'draft' }, 'es', true)).not.toBeNull();
	});
	test('orders without mutating input and retains valid slides', () => {
		expect(adaptHeroBlock('block_hero_carousel', carousel, 'es')?.slides.map((s) => s.id)).toEqual([
			second,
			id
		]);
		expect(carousel.slides[0].sort).toBe(2);
		expect(
			adaptHeroBlock(
				'block_hero_carousel',
				{ ...carousel, slides: [null, carousel.slides[0], { id: second, sort: 0, hero_id: null }] },
				'es'
			)?.slides
		).toHaveLength(1);
	});
	test('unknown variants retain base content; empty carousels disappear', () => {
		expect(
			adaptHeroBlock('block_hero_carousel', { ...carousel, variant: 'future' }, 'es')?.variant
		).toBe('hero-a');
		expect(adaptHeroBlock('block_hero_carousel', { ...carousel, slides: [] }, 'es')).toBeNull();
	});
	test('resolves localized media and requires meaningful alt when informative', () => {
		const t = hero.translations[0];
		expect(adaptHeroBlock('block_hero', { ...hero, image: null }, 'es')).toBeNull();
		expect(
			adaptHeroBlock(
				'block_hero',
				{ ...hero, image: null, translations: [{ ...t, media: second }] },
				'es'
			)?.slides[0].image
		).toBe(second);
		expect(
			adaptHeroBlock('block_hero', { ...hero, translations: [{ ...t, decorative: false }] }, 'es')
		).toBeNull();
	});
	test('sanitizes HTML and blocks active URLs', () => {
		expect(
			cleanHeroHtml(
				'<p onclick="alert(1)">Hola <strong>Panamá</strong><script>alert(1)</script><svg onload="alert(1)"></svg><img src=x onerror=alert(1)></p>'
			)
		).toBe('<p>Hola <strong>Panamá</strong></p>');
		for (const link of [
			'javascript:alert(1)',
			'//evil.com',
			'/\\evil.com',
			'https://user:password@evil.com',
			'data:text/html,x',
			'https:\n//evil.com'
		])
			expect(isSafeHeroLink(link)).toBe(false);
		for (const link of ['/es/', 'https://www.copaair.com/es/?x=1#test'])
			expect(isSafeHeroLink(link)).toBe(true);
	});
	test.each(['es', 'en', 'pt'])('uses the %s icon file without serializing SVG code', (locale) => {
		const fileIds = [id, second, '06d5fd89-f62c-44d9-9cdd-86b9eb224ef2'];
		const locales = ['es', 'en', 'pt'];
		const output = adaptHeroBlock(
			'block_hero',
			{
				...hero,
				translations: locales.map((languages_code, index) => ({
					...hero.translations[0],
					languages_code,
					icon: { image: fileIds[index], code: `<svg>${'x'.repeat(100_000)}</svg>` }
				}))
			},
			locale
		);
		expect(output?.slides[0].icon).toBe(
			`https://cm-marketing.directus.app/assets/${fileIds[locales.indexOf(locale)]}`
		);
		expect(JSON.stringify(output)).not.toContain('data:image');
		expect(JSON.stringify(output).length).toBeLessThan(1_000);
	});
	test.each([null, undefined, '', 'not-a-file-id', 'https://example.com/icon.webp'])(
		'keeps the hero without an icon when its file reference is %s',
		(image) => {
			const output = adaptHeroBlock(
				'block_hero',
				{
					...hero,
					translations: [{ ...hero.translations[0], icon: { image, code: '<svg></svg>' } }]
				},
				'es'
			);
			expect(output).not.toBeNull();
			expect(output?.slides[0].icon).toBeNull();
		}
	);
	test('invalid new blocks do not remove unrelated sections', () => {
		const other = { collection: 'Text_Content', item: { title: 'Other' } };
		const result = prepareHeroSections(
			[
				{
					landmark: 'hero',
					section_content: [
						other,
						{ collection: 'block_hero', item: null },
						{ collection: 'block_hero', item: hero }
					]
				}
			],
			'es'
		) as Array<{ section_content: Array<{ item: { heading?: string } }> }>;
		expect(result[0].section_content).toHaveLength(2);
		expect(result[0].section_content[0]).toBe(other);
		expect(result[0].section_content[1].item.heading).toBe('h1');
	});
});

test('standalone B/C variants do not change carousel presentation', () => {
	for (const variant of ['hero-b', 'hero-c']) {
		expect(adaptHeroBlock('block_hero', { ...hero, variant }, 'es')?.variant).toBe(variant);
		expect(
			adaptHeroBlock(
				'block_hero_carousel',
				{ ...carousel, slides: [{ id, hero_id: { ...hero, variant } }] },
				'es'
			)?.variant
		).toBe('hero-a');
	}
	expect(adaptHeroBlock('block_hero', { ...hero, variant: 'future' }, 'es')?.variant).toBe(
		'hero-a'
	);
});
