import { expect, test, vi } from 'vitest';
const getItems = vi.hoisted(() => vi.fn());
vi.mock('$lib/infrastructure/directus/utils', () => ({
	getItems,
	getTranslationFilter: (locale: string) => ({
		translations: { _filter: { languages_code: { _eq: locale } } }
	})
}));
import { hydrateHeroSections } from './hero-repository';
const id = '9756fda7-6c4d-4522-b951-1247c0cbaf80';
test('pages without hero references make no extra requests', async () => {
	getItems.mockClear();
	const sections = [{ section_content: [{ collection: 'Text_Content', item: { id: 1 } }] }];
	expect(await hydrateHeroSections(sections, 'es')).toEqual(sections);
	expect(getItems).not.toHaveBeenCalled();
});
test('loads referenced heroes separately and requests only published content', async () => {
	getItems.mockResolvedValueOnce([
		{
			id,
			status: 'published',
			image: id,
			translations: [{ languages_code: 'es', title: 'Panamá', decorative: true }]
		}
	]);
	const output = (await hydrateHeroSections(
		[{ landmark: 'hero', section_content: [{ id: 1, collection: 'block_hero', item: { id } }] }],
		'es'
	)) as Array<{ section_content: Array<{ item: { slides: unknown[] } }> }>;
	expect(output[0].section_content[0].item.slides).toHaveLength(1);
	expect(getItems).toHaveBeenLastCalledWith(
		'block_hero',
		expect.objectContaining({ filter: { id: { _in: [id] }, status: { _eq: 'published' } } }),
		null
	);
});
test('an unavailable hero leaves other content intact', async () => {
	getItems.mockResolvedValueOnce(null);
	const other = { collection: 'Text_Content', item: { id: 8 } };
	const output = await hydrateHeroSections(
		[{ section_content: [other, { collection: 'block_hero', item: id }] }],
		'es'
	);
	expect(output).toEqual([{ section_content: [other] }]);
});
