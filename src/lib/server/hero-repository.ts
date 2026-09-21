import { prepareArticleSections } from './article';
import { getItems, getTranslationFilter } from '$lib/infrastructure/directus/utils';
import { heroQueryFields, heroCarouselQueryFields } from '$lib/directus/hero';
import { prepareHeroSections } from './hero';
const record = (v: unknown): v is Record<string, unknown> =>
	!!v && typeof v === 'object' && !Array.isArray(v);

export async function hydrateHeroSections(sections: unknown, locale: string) {
	if (!Array.isArray(sections)) return sections;
	const entries = sections.flatMap((s) =>
		record(s) && Array.isArray(s.section_content) ? s.section_content : []
	);
	const hydrated = new Map<string, unknown>();
	await Promise.all(
		(['block_hero', 'block_hero_carousel'] as const).map(async (collection) => {
			const ids = [
				...new Set(
					entries.flatMap((e) =>
						record(e) && e.collection === collection
							? [record(e.item) ? e.item.id : e.item].filter(
									(id): id is string => typeof id === 'string' && /^[a-f0-9-]{36}$/i.test(id)
								)
							: []
					)
				)
			];
			if (!ids.length) return;
			const items = await getItems(
				collection,
				{
					fields: collection === 'block_hero' ? heroQueryFields : heroCarouselQueryFields,
					filter: { id: { _in: ids }, status: { _eq: 'published' } },
					limit: -1,
					deep:
						collection === 'block_hero'
							? getTranslationFilter(locale)
							: {
									slides: {
										_sort: ['sort', 'id'],
										_limit: -1,
										hero_id: getTranslationFilter(locale)
									}
								}
				},
				null
			);
			for (const item of items || [])
				if (record(item)) hydrated.set(`${collection}:${item.id}`, item);
		})
	);
	return prepareArticleSections(
		prepareHeroSections(
			sections.map((s) =>
				!record(s) || !Array.isArray(s.section_content)
					? s
					: {
							...s,
							section_content: s.section_content.map((e) =>
								!record(e) || !['block_hero', 'block_hero_carousel'].includes(String(e.collection))
									? e
									: {
											...e,
											item:
												hydrated.get(`${e.collection}:${record(e.item) ? e.item.id : e.item}`) ||
												null
										}
							)
						}
			),
			locale
		)
	);
}
